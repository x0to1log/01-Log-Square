import Link from 'next/link'
import type { Project } from '@/lib/types/database'

export function GlobalBar({
  project,
  currentRoom,
  pendingCount,
}: {
  project: Project
  currentRoom: string
  pendingCount: number
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          01 Log Square
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span className="text-sm font-medium">{project.name}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
          {project.phase}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium text-zinc-600 dark:text-zinc-400">{currentRoom}</span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            승인 대기 {pendingCount}
          </span>
        )}
      </div>
    </header>
  )
}
