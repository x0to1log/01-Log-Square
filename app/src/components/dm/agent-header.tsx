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
    <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
      <AgentProfilePopover
        agentKey={agent.key}
        agentName={agent.name}
        roleTitle={agent.role_title}
        projectId={projectId}
      >
        <img
          src={`/sprites/characters/${agent.key}/south.png`}
          alt={agent.name}
          className="h-8 w-8 rounded-lg object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      </AgentProfilePopover>
      <div className="flex-1">
        <h2 className="text-sm font-semibold">{agent.name}</h2>
        <p className="text-xs text-zinc-400">{agent.role_title}</p>
      </div>
      <Link
        href={`/project/${projectId}`}
        className="rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Back to Meeting Room
      </Link>
    </div>
  )
}
