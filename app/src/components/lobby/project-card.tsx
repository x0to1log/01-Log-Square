'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/types/database'
import { ProjectContextMenu } from './project-context-menu'
import { EditProjectDialog } from './edit-project-dialog'

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

const PHASE_COLORS: Record<string, string> = {
  discovery: 'bg-violet-500',
  planning: 'bg-blue-500',
  building: 'bg-amber-500',
  review: 'bg-orange-500',
  shipping: 'bg-emerald-500',
  archived: 'bg-neutral-400',
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  paused: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  archived: 'bg-neutral-500/10 text-neutral-500',
  completed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}

export function ProjectCard({ project }: { project: Project }) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [showEdit, setShowEdit] = useState(false)

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

  const phaseColor = PHASE_COLORS[project.phase] ?? 'bg-neutral-400'

  return (
    <>
      <Link
        href={`/project/${project.id}`}
        onContextMenu={handleContextMenu}
        className="group relative flex cursor-pointer flex-col transition-all duration-200 hover:-translate-y-0.5"
      >
        {/* Folder tab */}
        <div className="flex items-end gap-0.5">
          <div className="flex h-7 items-center gap-1.5 rounded-t-lg bg-surface px-3">
            <span className={`h-1.5 w-1.5 rounded-full ${phaseColor}`} />
            <span className="text-[10px] font-medium text-foreground-muted">
              {PHASE_LABELS[project.phase] ?? project.phase}
            </span>
          </div>
          <div className="h-2.5 w-5 rounded-t-md bg-surface" />
        </div>

        {/* Folder body */}
        <div className="relative rounded-b-xl rounded-tr-xl border border-border bg-surface p-4 transition-all duration-200 group-hover:border-accent/40 group-hover:shadow-md group-hover:shadow-accent/5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3
                className="truncate text-sm font-semibold text-foreground transition-colors duration-200 group-hover:text-accent"
                style={{ textWrap: 'balance' } as React.CSSProperties}
              >
                {project.name}
              </h3>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[project.status] ?? ''}`}>
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </div>

          {/* Description */}
          {project.description ? (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground-muted">
              {project.description}
            </p>
          ) : (
            <p className="mt-2 text-xs italic text-border-hover">설명 없음</p>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1.5">
              <img
                src="/sprites/characters/ceo/south.png"
                alt="대표"
                width={20}
                height={20}
                className="pixel-art object-contain"
              />
              <span className="text-[10px] text-foreground-muted">대표</span>
            </div>

            {lastOpened && (
              <span className="text-[10px] text-foreground-muted">{lastOpened}</span>
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
