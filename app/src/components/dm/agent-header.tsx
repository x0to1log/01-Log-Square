'use client'

import Link from 'next/link'
import type { AgentInstance } from '@/lib/types/database'
import { AgentProfilePopover } from '@/components/ui/agent-profile-popover'

export function AgentHeader({
  projectId,
  agent,
}: {
  projectId: number
  agent: AgentInstance
}) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3">
      <AgentProfilePopover
        agentKey={agent.key}
        agentName={agent.name}
        roleTitle={agent.role_title}
        projectId={projectId}
      >
        <img
          src={`/sprites/characters/${agent.key}/south.png`}
          alt={agent.name}
          className="pixel-art h-8 w-8 rounded-lg object-contain"
        />
      </AgentProfilePopover>
      <div className="flex-1">
        <h2 className="text-sm font-semibold">{agent.name}</h2>
        <p className="text-xs text-foreground-muted">{agent.role_title}</p>
      </div>
      <Link
        href={`/project/${projectId}`}
        className="rounded-md border border-border px-3 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-hover"
      >
        Back to Meeting Room
      </Link>
    </div>
  )
}
