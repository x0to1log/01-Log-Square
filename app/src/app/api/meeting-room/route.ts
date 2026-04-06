import { NextResponse } from 'next/server'
import { Agent } from '@mastra/core/agent'
import { createServerClient } from '@/lib/supabase/server'
import { getCoreAgents } from '@/mastra/agents'
import { loadProjectContext, formatProjectContext } from '@/mastra/context'
import type { Message, Thread, AgentInstance } from '@/lib/types/database'
import { z } from 'zod'

export const maxDuration = 120

const ROUTER_MODEL = 'openai/gpt-5-mini'

/**
 * Lightweight router that decides which agents should respond.
 * Does NOT generate a user-facing message — only returns agent keys.
 */
async function routeToAgents(
  ceoMessage: string,
  conversationContext: string,
  availableAgents: { key: string; name: string; role_title: string }[],
): Promise<string[]> {
  const agentList = availableAgents
    .map((a) => `- ${a.key}: ${a.name} (${a.role_title})`)
    .join('\n')

  const router = new Agent({
    id: 'meeting-room-router',
    name: 'Router',
    model: ROUTER_MODEL,
    instructions: `You are a meeting room router. Your ONLY job is to decide which agents should respond to the CEO's message.

Available agents:
${agentList}

Rules:
- Pick 1-5 agents based on relevance to the message.
- Technical topics → cto (+ risk_critic if risky)
- Strategic/business topics → cso (+ coo for execution)
- Operational/scheduling topics → coo
- Risk concerns → risk_critic
- Verification/fact-checking → verifier
- Broad questions or greetings → coo, cso, cto (3 main leads)
- If the message is a simple response, acknowledgment, or follow-up to one agent's point, only that agent needs to reply.
- Return ONLY the agent keys as a JSON array. No explanation.`,
  })

  try {
    const result = await router.generate(
      `## Recent conversation\n${conversationContext}\n\n## CEO's message\n${ceoMessage}\n\nWhich agents should respond? Return a JSON array of agent keys.`,
      {
        structuredOutput: {
          schema: z.object({
            agents: z.array(z.string()).describe('Agent keys that should respond'),
          }),
        },
      },
    )

    if (result.object?.agents) {
      const validKeys = new Set(availableAgents.map((a) => a.key))
      return result.object.agents.filter((k: string) => validKeys.has(k))
    }
  } catch (err) {
    console.error('Router failed, falling back to core 3:', err)
  }

  // Fallback: COO, CSO, CTO
  return ['coo', 'cso', 'cto']
}

export async function POST(req: Request) {
  const supabase = createServerClient()
  const body = await req.json()

  const { project_id, thread_id, body_md } = body as {
    project_id: number
    thread_id: number
    body_md: string
  }

  if (!project_id || !thread_id || !body_md?.trim()) {
    return NextResponse.json(
      { error: 'project_id, thread_id, and body_md are required' },
      { status: 400 },
    )
  }

  const { data: thread } = await supabase
    .from('threads')
    .select('*')
    .eq('id', thread_id)
    .single() as { data: Thread | null }

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  // Save CEO message
  const { data: ceoMessage } = await supabase
    .from('messages')
    .insert({
      owner_user_id: thread.owner_user_id,
      thread_id,
      sender_type: 'representative',
      message_kind: 'chat',
      body_md,
    })
    .select()
    .single() as { data: Message | null }

  try {
    // Load project context + all core agents
    const ctx = await loadProjectContext(project_id)
    const projectContext = formatProjectContext(ctx)
    const coreAgents = await getCoreAgents(project_id, projectContext)

    // Build conversation context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', thread_id)
      .order('created_at', { ascending: false })
      .limit(20) as { data: Message[] | null }

    // Build agent instance map for sender names in context
    const instanceMap = new Map<number, AgentInstance>()
    for (const { instance } of coreAgents) {
      instanceMap.set(instance.id, instance)
    }

    const contextMessages = (recentMessages ?? [])
      .reverse()
      .map((m) => {
        let sender = '대표'
        if (m.sender_type === 'agent' && m.sender_agent_instance_id) {
          const inst = instanceMap.get(m.sender_agent_instance_id)
          sender = inst?.name ?? 'Agent'
        } else if (m.sender_type === 'system') {
          sender = 'System'
        }
        return `[${sender}]: ${m.body_md}`
      })
      .join('\n')

    // Step 1: Route — decide which agents should respond
    const agentDescriptions = coreAgents.map(({ instance }) => ({
      key: instance.key,
      name: instance.name,
      role_title: instance.role_title,
    }))

    const selectedKeys = await routeToAgents(body_md, contextMessages, agentDescriptions)
    console.log(`Meeting Room routing: ${selectedKeys.join(', ')}`)

    // Step 2: Call only selected agents
    const selectedAgents = coreAgents.filter(({ instance }) =>
      selectedKeys.includes(instance.key),
    )

    const prompt = `## 최근 대화
${contextMessages}

## 대표의 현재 메시지
${body_md}

위 내용에 대해 당신의 역할 관점에서 의견을 제시하세요. 다른 에이전트의 의견은 보이지 않으므로, 당신만의 독립적인 관점으로 답변하세요.`

    const savedMessages: Message[] = []

    for (const { agent, instance } of selectedAgents) {
      try {
        const result = await agent.generate(prompt)

        const { data: savedMsg } = await supabase
          .from('messages')
          .insert({
            owner_user_id: thread.owner_user_id,
            thread_id,
            sender_type: 'agent',
            sender_agent_instance_id: instance.id,
            message_kind: 'chat',
            body_md: result.text,
          })
          .select()
          .single() as { data: Message | null }

        if (savedMsg) savedMessages.push(savedMsg)
      } catch (err) {
        console.error(`Agent ${instance.key} failed:`, err)
      }
    }

    // Update thread timestamp
    await supabase
      .from('threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', thread_id)

    return NextResponse.json({
      ceoMessage,
      agentMessages: savedMessages,
      routed: selectedKeys,
    })
  } catch (error) {
    console.error('Meeting Room error:', error)
    return NextResponse.json(
      { ceoMessage, error: 'Agent generation failed' },
      { status: 200 },
    )
  }
}
