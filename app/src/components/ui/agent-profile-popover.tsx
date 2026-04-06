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
  strategic_core: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  review_core: 'bg-red-500/15 text-red-600 dark:text-red-400',
  support_execution: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  specialist: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
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
  const layerColor = LAYER_COLORS[layer] ?? 'bg-zinc-500/15 text-zinc-500'

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
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {/* Profile image */}
          <div className="mb-3 flex justify-center">
            <img
              src={`/sprites/characters/${agentKey}/south.png`}
              alt={agentName}
              className="h-20 w-20 rounded-xl object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Name & title */}
          <div className="mb-3 text-center">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {agentName}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
          <div className="mb-3 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            활성
          </div>

          {/* DM link */}
          {projectId && (
            <Link
              href={`/project/${projectId}/dm/${agentKey}`}
              onClick={() => setIsOpen(false)}
              className="block w-full rounded-lg border border-zinc-200 px-3 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              DM 보내기
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
