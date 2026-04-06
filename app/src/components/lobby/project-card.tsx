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

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  archived: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
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

  return (
    <>
      <Link
        href={`/project/${project.id}`}
        onContextMenu={handleContextMenu}
        className="group flex flex-col rounded-lg border border-zinc-200 p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
      >
        <div className="flex items-start justify-between">
          <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {project.name}
          </h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[project.status] ?? ''}`}
          >
            {STATUS_LABELS[project.status] ?? project.status}
          </span>
        </div>

        {project.description && (
          <p className="mt-2 line-clamp-2 text-sm text-zinc-500">
            {project.description}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-zinc-400">
          <span>{PHASE_LABELS[project.phase] ?? project.phase}</span>
          {lastOpened && <span>마지막: {lastOpened}</span>}
        </div>
      </Link>

      {/* Context menu */}
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

      {/* Edit dialog */}
      {showEdit && (
        <EditProjectDialog
          project={project}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}
