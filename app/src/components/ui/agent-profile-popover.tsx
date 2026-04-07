'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

const LAYER_LABELS: Record<string, string> = {
  strategic_core: 'Strategic Core',
  review_core: 'Review Core',
  support_execution: 'Support & Execution',
  specialist: 'Specialist',
}

const LAYER_COLORS: Record<string, string> = {
  strategic_core: 'bg-amber-500/15 text-amber-600',
  review_core: 'bg-red-500/15 text-red-600',
  support_execution: 'bg-accent-muted text-accent',
  specialist: 'bg-purple-500/15 text-purple-600',
}

// Map agent keys to their layer
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

interface AgentProfilePopoverProps {
  agentKey: string
  agentName: string
  roleTitle: string
  projectId?: number
  children: React.ReactNode
}

export function AgentProfilePopover({
  agentKey,
  agentName,
  roleTitle,
  projectId,
  children,
}: AgentProfilePopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const layer = AGENT_LAYER[agentKey] ?? 'specialist'
  const layerLabel = LAYER_LABELS[layer] ?? layer
  const layerColor = LAYER_COLORS[layer] ?? 'bg-surface text-foreground-muted'

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer rounded-lg transition-opacity hover:opacity-80"
      >
        {children}
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-background p-4 shadow-lg"
        >
          {/* Profile image */}
          <div className="mb-3 flex justify-center">
            <img
              src={`/sprites/characters/${agentKey}/south.png`}
              alt={agentName}
              className="pixel-art h-20 w-20 rounded-xl object-contain"
            />
          </div>

          {/* Name & title */}
          <div className="mb-3 text-center">
            <h3 className="text-sm font-semibold text-foreground">
              {agentName}
            </h3>
            <p className="text-xs text-foreground-muted">
              {roleTitle}
            </p>
          </div>

          {/* Layer badge */}
          <div className="mb-3 flex justify-center">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${layerColor}`}>
              {layerLabel}
            </span>
          </div>

          {/* Status */}
          <div className="mb-3 flex items-center justify-center gap-1.5 text-xs text-foreground-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            활성
          </div>

          {/* DM link */}
          {projectId && (
            <Link
              href={`/project/${projectId}/dm/${agentKey}`}
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-lg border border-border px-3 py-2 text-center text-xs font-medium text-foreground-muted transition-colors hover:bg-surface-hover"
            >
              DM 보내기
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
