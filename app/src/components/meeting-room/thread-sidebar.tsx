'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Thread, AgentInstance } from '@/lib/types/database'
import { useUnread } from '@/lib/hooks/use-unread'

const LAYER_ORDER = ['strategic_core', 'review_core', 'support_execution', 'specialist'] as const
const LAYER_LABELS: Record<string, string> = {
  strategic_core: 'Strategic Core',
  review_core: 'Review Core',
  support_execution: 'Support & Execution',
  specialist: 'Specialists',
}

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
  const { getThreadUnread } = useUnread()
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
          className="text-xs text-foreground-muted transition-colors duration-200 hover:text-accent"
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
            unreadCount={getThreadUnread(meetingRoom.id)}
          />
        </div>
      )}

      {LAYER_ORDER.map((layer) => {
        const items = threadsByLayer.get(layer)
        if (!items?.length) return null

        return (
          <div key={layer} className="mb-2">
            <p className="mb-1 px-2 text-[10px] font-medium uppercase tracking-widest text-foreground-muted">
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
                unreadCount={getThreadUnread(thread.id)}
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
  agentKey,
  unreadCount,
}: {
  href: string
  label: string
  sublabel: string
  isActive: boolean
  agentKey?: string
  unreadCount?: number
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all duration-200 ${
        isActive
          ? 'bg-accent-muted font-medium text-accent'
          : 'text-foreground hover:bg-surface-hover'
      }`}
    >
      {agentKey ? (
        <img
          src={`/sprites/characters/${agentKey}/south.png`}
          alt={label}
          className="pixel-art h-6 w-6 shrink-0 object-contain"
        />
      ) : (
        <div className="h-6 w-6 shrink-0 rounded-sm bg-surface-active" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate">{label}</p>
        <p className="truncate text-xs text-foreground-muted">{sublabel}</p>
      </div>
      {unreadCount && unreadCount > 0 ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-background">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      ) : null}
    </Link>
  )
}
