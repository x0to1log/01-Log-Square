import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Project, Thread, AgentInstance } from '@/lib/types/database'
import { GlobalBar } from '@/components/ui/global-bar'
import { MobileHeader } from '@/components/ui/mobile-header'
import { PanelProvider } from '@/components/ui/panel-context'
import { CollapsiblePanel } from '@/components/ui/collapsible-panel'
import { ThreadSidebar } from '@/components/meeting-room/thread-sidebar'
import { OperationsPanel } from '@/components/meeting-room/operations-panel'

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', Number(id))
    .single() as { data: Project | null }

  if (!project) notFound()

  const { data: threads } = await supabase
    .from('threads')
    .select('*')
    .eq('project_id', project.id)
    .is('archived_at', null)
    .order('thread_type')
    .order('title') as { data: Thread[] | null }

  const { data: agents } = await supabase
    .from('agent_instances')
    .select('*')
    .eq('project_id', project.id)
    .order('display_order') as { data: AgentInstance[] | null }

  const { data: pendingDecisions } = await supabase
    .from('decisions')
    .select('id')
    .eq('project_id', project.id)
    .eq('status', 'pending_review') as { data: { id: number }[] | null }

  await supabase
    .from('projects')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', project.id)

  const meetingRoom = (threads ?? []).find((t) => t.thread_type === 'war_room')
  const dmThreads = (threads ?? []).filter((t) => t.thread_type === 'direct_message')

  const sidebarContent = (
    <ThreadSidebar
      projectId={project.id}
      meetingRoom={meetingRoom ?? null}
      dmThreads={dmThreads}
      agents={agents ?? []}
    />
  )

  const operationsContent = (
    <OperationsPanel projectId={project.id} />
  )

  return (
    <PanelProvider>
    <div className="flex h-screen flex-col">
      {/* Desktop: top bar (hidden on mobile) */}
      <div className="hidden lg:block">
        <GlobalBar
          project={project}
          currentRoom="The Meeting Room"
          pendingCount={pendingDecisions?.length ?? 0}
        />
      </div>

      {/* Mobile: compact header with drawer triggers (hidden on desktop) */}
      <MobileHeader
        title={project.name}
        leftDrawerContent={sidebarContent}
        rightDrawerContent={
          <div className="h-full overflow-y-auto">
            {operationsContent}
          </div>
        }
      />

      {/* 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — desktop only */}
        <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-zinc-200 lg:block dark:border-zinc-800">
          {sidebarContent}
        </aside>

        {/* Center: conversation — always visible */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>

        {/* Right: operations panel — collapsible on desktop */}
        <CollapsiblePanel>
          {operationsContent}
        </CollapsiblePanel>
      </div>
    </div>
    </PanelProvider>
  )
}
