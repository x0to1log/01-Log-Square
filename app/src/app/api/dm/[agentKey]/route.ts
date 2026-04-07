import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getProjectAgent, selectModel } from '@/mastra/agents'
import { loadProjectContext, formatProjectContext } from '@/mastra/context'
import type { Message, Thread } from '@/lib/types/database'

export const maxDuration = 120

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentKey: string }> },
) {
  const { agentKey } = await params
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

  // Verify thread exists
  const { data: thread } = await supabase
    .from('threads')
    .select('*')
    .eq('id', thread_id)
    .single() as { data: Thread | null }

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  // Save representative's message
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
    const { agent, instance } = await getProjectAgent(project_id, agentKey, projectContext, model)

    // Load recent messages for context
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', thread_id)
      .order('created_at', { ascending: false })
      .limit(20) as { data: Message[] | null }

    const contextMessages = (recentMessages ?? [])
      .reverse()
      .map((m) => {
        const sender = m.sender_type === 'representative' ? '대표' : m.sender_type
        return `[${sender}]: ${m.body_md}`
      })
      .join('\n')

    const prompt = `## Recent Conversation
${contextMessages}

## CEO's Message
${body_md}`

    const result = await agent.generate(prompt, { maxSteps: 5 })

    // Save agent's response
    const { data: savedMessage } = await supabase
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

    // Update thread + agent last active
    await Promise.all([
      supabase
        .from('threads')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', thread_id),
      supabase
        .from('agent_instances')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', instance.id),
    ])

    return NextResponse.json({
      ceoMessage,
      agentMessage: savedMessage,
      text: result.text,
    })
  } catch (error) {
    console.error(`DM agent (${agentKey}) error:`, error)
    return NextResponse.json(
      { ceoMessage, error: 'Agent generation failed' },
      { status: 200 },
    )
  }
}
