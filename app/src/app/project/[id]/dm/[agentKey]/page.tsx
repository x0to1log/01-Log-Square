import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Thread, Message, AgentInstance } from '@/lib/types/database'
import { AgentHeader } from '@/components/dm/agent-header'
import { MessageTimeline } from '@/components/meeting-room/message-timeline'

export default async function DMPage({
  params,
}: {
  params: Promise<{ id: string; agentKey: string }>
}) {
  const { id, agentKey } = await params
  const projectId = Number(id)
  const supabase = createServerClient()

  // Find the agent instance
  const { data: agent } = await supabase
    .from('agent_instances')
    .select('*')
    .eq('project_id', projectId)
    .eq('key', agentKey)
    .single() as { data: AgentInstance | null }

  if (!agent) notFound()

  // Find the DM thread for this agent
  const { data: thread } = await supabase
    .from('threads')
    .select('*')
    .eq('project_id', projectId)
    .eq('thread_type', 'direct_message')
    .eq('direct_agent_instance_id', agent.id)
    .is('archived_at', null)
    .single() as { data: Thread | null }

  if (!thread) notFound()

  // Load messages
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true })
    .limit(100) as { data: Message[] | null }

  const agentMap: Record<number, { name: string; role_title: string; key: string }> = {
    [agent.id]: { name: agent.name, role_title: agent.role_title, key: agent.key },
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AgentHeader projectId={projectId} agent={agent} />

      <MessageTimeline
        messages={messages ?? []}
        threadId={thread.id}
        projectId={projectId}
        mode="dm"
        agentKey={agentKey}
        agentMap={agentMap}
      />
    </div>
  )
}
