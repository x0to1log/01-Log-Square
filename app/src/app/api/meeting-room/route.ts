import { NextResponse } from 'next/server'
import { Agent } from '@mastra/core/agent'
import { createServerClient } from '@/lib/supabase/server'
import { getCoreAgents, selectModel } from '@/mastra/agents'
import { loadProjectContext, formatProjectContext } from '@/mastra/context'
import type { Message, Thread, AgentInstance } from '@/lib/types/database'
import { z } from 'zod'

export const maxDuration = 120

const ROUTER_MODEL = 'openai/gpt-5-mini'

/**
 * Lightweight router that decides which agents should respond.
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

  return ['coo', 'cso', 'cto']
}

/**
 * Decide which agents want to react to the latest discussion round.
 * Returns keys of agents that have something to add.
 */
async function getReactingAgents(
  discussion: string,
  availableAgents: { key: string; name: string; role_title: string }[],
  previousRespondents: string[],
): Promise<string[]> {
  const agentList = availableAgents
    .map((a) => `- ${a.key}: ${a.name} (${a.role_title})`)
    .join('\n')

  const router = new Agent({
    id: 'discussion-reactor',
    name: 'Reactor',
    model: ROUTER_MODEL,
    instructions: `You decide which agents would want to react to the ongoing discussion.

Available agents:
${agentList}

Agents who already spoke this round: ${previousRespondents.join(', ')}

Rules:
- Only pick agents who have something NEW to add — disagreement, clarification, build on someone's point.
- Do NOT pick agents just to agree or repeat.
- It's okay to return an empty array if no one has anything new.
- Agents who didn't speak in Round 1 can join if the topic now touches their area.
- Return a JSON array of agent keys. Empty array [] is valid.`,
  })

  try {
    const result = await router.generate(
      `## Discussion so far\n${discussion}\n\nWhich agents want to react? Return a JSON array (can be empty).`,
      {
        structuredOutput: {
          schema: z.object({
            agents: z.array(z.string()).describe('Agent keys that want to react, or empty'),
          }),
        },
      },
    )

    if (result.object?.agents) {
      const validKeys = new Set(availableAgents.map((a) => a.key))
      return result.object.agents.filter((k: string) => validKeys.has(k))
    }
  } catch (err) {
    console.error('Reactor failed:', err)
  }

  return []
}

/**
 * Build conversation context string from recent messages.
 */
function buildContext(
  messages: Message[],
  instanceMap: Map<number, AgentInstance>,
): string {
  return messages
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
}

/**
 * Save an agent's message to DB and return it.
 */
async function saveAgentMessage(
  supabase: ReturnType<typeof createServerClient>,
  ownerUserId: string,
  threadId: number,
  instanceId: number,
  text: string,
): Promise<Message | null> {
  const { data } = await supabase
    .from('messages')
    .insert({
      owner_user_id: ownerUserId,
      thread_id: threadId,
      sender_type: 'agent',
      sender_agent_instance_id: instanceId,
      message_kind: 'chat',
      body_md: text,
    })
    .select()
    .single() as { data: Message | null }
  return data
}

const MAX_DISCUSSION_ROUNDS = 3

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
    const ctx = await loadProjectContext(project_id)
    const projectContext = formatProjectContext(ctx)
    const model = selectModel(body_md)
    console.log(`[Meeting Room] Model: ${model}`)
    const coreAgents = await getCoreAgents(project_id, projectContext, model)

    const instanceMap = new Map<number, AgentInstance>()
    const agentMap = new Map<string, { agent: Agent; instance: AgentInstance }>()
    for (const ca of coreAgents) {
      instanceMap.set(ca.instance.id, ca.instance)
      agentMap.set(ca.instance.key, ca)
    }

    const agentDescriptions = coreAgents.map(({ instance }) => ({
      key: instance.key,
      name: instance.name,
      role_title: instance.role_title,
    }))

    // Load recent messages for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', thread_id)
      .order('created_at', { ascending: false })
      .limit(20) as { data: Message[] | null }

    const contextMessages = buildContext(
      (recentMessages ?? []).reverse(),
      instanceMap,
    )

    // === Round 1: Check for @mentions or use router ===
    const mentionPattern = /@(\w+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionPattern.exec(body_md)) !== null) {
      mentions.push(match[1])
    }

    const validAgentKeys = new Set(agentDescriptions.map((a) => a.key))
    const mentionedKeys = mentions.includes('all')
      ? agentDescriptions.map((a) => a.key)
      : mentions.filter((k) => validAgentKeys.has(k))

    // If @mentions found, skip router and use them directly
    const selectedKeys = mentionedKeys.length > 0
      ? mentionedKeys
      : await routeToAgents(body_md, contextMessages, agentDescriptions)

    console.log(`[Meeting Room] Round 1 ${mentionedKeys.length > 0 ? '(@mention)' : '(router)'}: ${selectedKeys.join(', ')}`)

    const round1Prompt = `## 최근 대화
${contextMessages}

## 대표의 현재 메시지
${body_md}

위 내용에 대해 당신의 역할 관점에서 의견을 제시하세요.`

    const allSavedMessages: Message[] = []
    const round1Respondents: string[] = []

    for (const key of selectedKeys) {
      const ca = agentMap.get(key)
      if (!ca) continue
      try {
        const result = await ca.agent.generate(round1Prompt, { maxSteps: 5 })
        const saved = await saveAgentMessage(
          supabase, thread.owner_user_id, thread_id, ca.instance.id, result.text,
        )
        if (saved) {
          allSavedMessages.push(saved)
          round1Respondents.push(key)
        }
      } catch (err) {
        console.error(`[Meeting Room] Round 1 — ${key} failed:`, err)
      }
    }

    // === Rounds 2-3: Discussion ===
    let previousRespondents = round1Respondents

    for (let round = 2; round <= MAX_DISCUSSION_ROUNDS; round++) {
      // Check if CEO sent a new message (discussion interrupted)
      const { data: latestMsg } = await supabase
        .from('messages')
        .select('id, sender_type')
        .eq('thread_id', thread_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single() as { data: { id: number; sender_type: string } | null }

      if (latestMsg?.sender_type === 'representative' && latestMsg.id !== ceoMessage?.id) {
        console.log(`[Meeting Room] Round ${round} — CEO interrupted, stopping discussion`)
        break
      }

      // Get all messages so far for context
      const { data: allMsgs } = await supabase
        .from('messages')
        .select('*')
        .eq('thread_id', thread_id)
        .order('created_at', { ascending: true })
        .limit(30) as { data: Message[] | null }

      const fullContext = buildContext(allMsgs ?? [], instanceMap)

      // Ask router which agents want to react
      const reactingKeys = await getReactingAgents(
        fullContext, agentDescriptions, previousRespondents,
      )

      console.log(`[Meeting Room] Round ${round} reacting: ${reactingKeys.length > 0 ? reactingKeys.join(', ') : '(none)'}`)

      if (reactingKeys.length === 0) {
        console.log(`[Meeting Room] Round ${round} — no reactions, discussion complete`)
        break
      }

      const discussionPrompt = `## 현재까지의 회의 대화
${fullContext}

다른 에이전트들의 의견을 읽었습니다. 반응할 게 있으면 당신의 관점에서 말해주세요.
- 동의만 하려면 굳이 말하지 마세요.
- 반대, 보충, 질문, 새로운 관점이 있을 때만 말하세요.
- 짧게 답하세요.`

      const roundRespondents: string[] = []

      for (const key of reactingKeys) {
        const ca = agentMap.get(key)
        if (!ca) continue
        try {
          const result = await ca.agent.generate(discussionPrompt, { maxSteps: 5 })

          // Skip if agent says PASS or gives empty/trivial response
          const text = result.text.trim()
          if (!text || text === 'PASS' || text.length < 10) continue

          const saved = await saveAgentMessage(
            supabase, thread.owner_user_id, thread_id, ca.instance.id, text,
          )
          if (saved) {
            allSavedMessages.push(saved)
            roundRespondents.push(key)
          }
        } catch (err) {
          console.error(`[Meeting Room] Round ${round} — ${key} failed:`, err)
        }
      }

      previousRespondents = roundRespondents
      if (roundRespondents.length === 0) break
    }

    // Update thread timestamp
    await supabase
      .from('threads')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', thread_id)

    return NextResponse.json({
      ceoMessage,
      agentMessages: allSavedMessages,
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
