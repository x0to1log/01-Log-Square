'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/types/database'
import { ProjectContextMenu } from './project-context-menu'
import { EditProjectDialog } from './edit-project-dialog'
import { useUnread } from '@/lib/hooks/use-unread'

const STATUS_LABELS: Record<string, string> = {
  active: '진행 중',
  paused: '보류',
  archived: '보관됨',
  completed: '완료',
}

const PHASE_LABELS: Record<string, string> = {
  discovery: '탐색',
  planning: '계획',
  building: '구현',
  review: '검토',
  shipping: '출시',
  archived: '보관',
}

const PHASE_DOT: Record<string, string> = {
  discovery: 'bg-violet-400',
  planning: 'bg-blue-400',
  building: 'bg-amber-400',
  review: 'bg-orange-400',
  shipping: 'bg-emerald-400',
  archived: 'bg-neutral-400',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'text-emerald-500',
  paused: 'text-amber-500',
  archived: 'text-foreground-muted',
  completed: 'text-accent',
}

export function ProjectCard({ project }: { project: Project }) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showEdit, setShowEdit] = useState(false)
  const { getProjectUnread } = useUnread()
  const unreadCount = getProjectUnread(project.id)

  const lastOpened = project.last_opened_at
    ? new Date(project.last_opened_at).toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const dot = PHASE_DOT[project.phase] ?? 'bg-neutral-400'

  return (
    <>
      <Link
        href={`/project/${project.id}`}
        onContextMenu={handleContextMenu}
        className="group relative flex cursor-pointer flex-col transition-all duration-200 hover:-translate-y-1"
      >
        {/* Tab — trapezoid, fully above the body */}
        <div
          className="flex w-fit items-center gap-1.5 rounded-t-lg border border-b-0 border-border bg-surface-active px-3 py-1"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 0 100%)',
          }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
          <span className="pr-1 text-[9px] font-semibold uppercase tracking-wider text-foreground-muted">
            {PHASE_LABELS[project.phase] ?? project.phase}
          </span>
        </div>

        {/* Body — top-left corner square where tab connects */}
        <div className="flex h-[170px] flex-col rounded-2xl rounded-tl-none border border-border bg-surface p-4 transition-all duration-200 group-hover:border-accent/40 group-hover:shadow-lg group-hover:shadow-accent/5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <h3
              className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-accent"
              style={{ textWrap: 'balance' } as React.CSSProperties}
            >
              {project.name}
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-background">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <span className={`mt-0.5 shrink-0 text-[10px] font-medium ${STATUS_COLORS[project.status] ?? 'text-foreground-muted'}`}>
                {STATUS_LABELS[project.status] ?? project.status}
              </span>
            </div>
          </div>

          {/* Description */}
          {project.description ? (
            <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-foreground-muted">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-[12px] italic text-foreground-muted/40">
              설명이 아직 없습니다
            </p>
          )}

          {/* Footer — pinned to bottom */}
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                <img src="/sprites/characters/ceo/south.png" alt="대표" width={20} height={20} className="pixel-art rounded-md border border-border bg-surface object-contain p-px" />
                <img src="/sprites/characters/coo/south.png" alt="COO" width={20} height={20} className="pixel-art rounded-md border border-border bg-surface object-contain p-px" />
                <img src="/sprites/characters/cto/south.png" alt="CTO" width={20} height={20} className="pixel-art rounded-md border border-border bg-surface object-contain p-px" />
              </div>
              <span className="text-[10px] text-foreground-muted">+8</span>
            </div>

            {lastOpened && (
              <span className="text-[10px] text-foreground-muted/60">{lastOpened}</span>
            )}
          </div>
        </div>
      </Link>

      {contextMenu && (
        <ProjectContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onEdit={() => {
            setContextMenu(null)
            setShowEdit(true)
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {showEdit && (
        <EditProjectDialog project={project} onClose={() => setShowEdit(false)} />
      )}
    </>
  )
}
