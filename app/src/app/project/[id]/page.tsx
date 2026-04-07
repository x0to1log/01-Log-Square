import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Thread, Message, AgentInstance } from '@/lib/types/database'
import { MessageTimeline } from '@/components/meeting-room/message-timeline'
import { PanelToggleButton } from '@/components/ui/panel-toggle-button'

export default async function MeetingRoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const projectId = Number(id)
  const supabase = createServerClient()

  const { data: meetingRoom } = await supabase
    .from('threads')
    .select('*')
    .eq('project_id', projectId)
    .eq('thread_type', 'war_room')
    .is('archived_at', null)
    .order('id')
    .limit(1)
    .single() as { data: Thread | null }

  if (!meetingRoom) notFound()

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('thread_id', meetingRoom.id)
    .order('created_at', { ascending: true })
    .limit(100) as { data: Message[] | null }

  const { data: agents } = await supabase
    .from('agent_instances')
    .select('*')
    .eq('project_id', projectId) as { data: AgentInstance[] | null }

  const agentMap: Record<number, { name: string; role_title: string; key: string }> = {}
  for (const agent of agents ?? []) {
    agentMap[agent.id] = { name: agent.name, role_title: agent.role_title, key: agent.key }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-surface-active" />
          <div>
            <h2 className="text-sm font-semibold text-foreground">The Meeting Room</h2>
            <p className="text-xs text-foreground-muted">전체 회의 · Core 멤버 참여</p>
          </div>
        </div>
        <PanelToggleButton />
      </div>

      <MessageTimeline
        messages={messages ?? []}
        threadId={meetingRoom.id}
        projectId={projectId}
        mode="meeting-room"
        agentMap={agentMap}
      />
    </div>
  )
}
