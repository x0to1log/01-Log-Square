'use client'

import { useViewMode } from './view-mode-context'
import { OfficeMap } from '@/components/map/office-map'
import { CollapsiblePanel } from '@/components/ui/collapsible-panel'
import type { AgentInstance } from '@/lib/types/database'

export function ProjectWorkspace({
  children,
  sidebarContent,
  operationsContent,
  projectId,
  agents,
}: {
  children: React.ReactNode
  sidebarContent: React.ReactNode
  operationsContent: React.ReactNode
  projectId: number
  agents: AgentInstance[]
}) {
  const { mode } = useViewMode()

  if (mode === 'map') {
    return (
      <div className="flex flex-1 overflow-hidden">
        <OfficeMap projectId={projectId} agents={agents} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-border lg:block">
        {sidebarContent}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
      <CollapsiblePanel>
        {operationsContent}
      </CollapsiblePanel>
    </div>
  )
}
