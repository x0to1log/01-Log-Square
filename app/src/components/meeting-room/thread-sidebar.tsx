'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Thread, AgentInstance } from '@/lib/types/database'

const LAYER_ORDER = ['strategic_core', 'review_core', 'support_execution', 'specialist'] as const
const LAYER_LABELS: Record<string, string> = {
  strategic_core: 'Strategic Core',
  review_core: 'Review Core',
  support_execution: 'Support & Execution',
  specialist: 'Specialists',
}

// Map agent keys to their layer (from agent_templates design)
const AGENT_LAYER: Record<string, string> = {
  coo: 'strategic_core',
  cso: 'strategic_core',
  cto: 'strategic_core',
  risk_critic: 'review_core',
  verifier: 'review_core',
  documentation_manager: 'support_execution',
  builder: 'support_execution',
  brand_designer: 'specialist',
  content_creator: 'specialist',
  trend_scout: 'specialist',
}

export function ThreadSidebar({
  projectId,
  meetingRoom,
  dmThreads,
  agents,
}: {
  projectId: number
  meetingRoom: Thread | null
  dmThreads: Thread[]
  agents: AgentInstance[]
}) {
  const pathname = usePathname()
  const agentMap = new Map(agents.map((a) => [a.id, a]))

  const threadsByLayer = new Map<string, { thread: Thread; agent: AgentInstance }[]>()
  for (const thread of dmThreads) {
    const agent = thread.direct_agent_instance_id
      ? agentMap.get(thread.direct_agent_instance_id)
      : null
    if (!agent) continue
    const layer = AGENT_LAYER[agent.key] ?? 'specialist'
    const existing = threadsByLayer.get(layer) ?? []
    existing.push({ thread, agent })
    threadsByLayer.set(layer, existing)
  }

  return (
    <nav className="flex flex-col gap-1 p-3">
      <div className="mb-2 px-2">
        <Link
          href="/"
          className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          ← 프로젝트 목록
        </Link>
      </div>

      {meetingRoom && (
        <div className="mb-3">
          <ThreadCell
            href={`/project/${projectId}`}
            label="The Meeting Room"
            sublabel="전체 회의"
            isActive={pathname === `/project/${projectId}`}
            badge={meetingRoom.last_message_at ? undefined : 'empty'}
          />
        </div>
      )}

      {LAYER_ORDER.map((layer) => {
        const items = threadsByLayer.get(layer)
        if (!items?.length) return null

        return (
          <div key={layer} className="mb-2">
            <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-zinc-400">
              {LAYER_LABELS[layer] ?? layer}
            </p>
            {items.map(({ thread, agent }) => (
              <ThreadCell
                key={thread.id}
                href={`/project/${projectId}/dm/${agent.key}`}
                label={agent.name}
                sublabel={agent.role_title}
                isActive={pathname === `/project/${projectId}/dm/${agent.key}`}
                agentKey={agent.key}
              />
            ))}
          </div>
        )
      })}
    </nav>
  )
}

function ThreadCell({
  href,
  label,
  sublabel,
  isActive,
  badge,
  agentKey,
}: {
  href: string
  label: string
  sublabel: string
  isActive: boolean
  badge?: string
  agentKey?: string
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
        isActive
          ? 'bg-zinc-100 font-medium dark:bg-zinc-800'
          : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
      }`}
    >
      {agentKey ? (
        <img
          src={`/sprites/characters/${agentKey}/south.png`}
          alt={label}
          className="h-6 w-6 shrink-0 rounded-sm object-contain"
          style={{ imageRendering: 'pixelated' }}
        />
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-sm bg-zinc-200 dark:bg-zinc-700" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate">{label}</p>
        <p className="truncate text-xs text-zinc-400">{sublabel}</p>
      </div>
      {badge && <span className="text-xs text-zinc-400">{badge}</span>}
    </Link>
  )
}
