import Link from 'next/link'
import type { Project } from '@/lib/types/database'
import { ThemeSwitcher } from './theme-switcher'

const PHASE_LABELS: Record<string, string> = {
  discovery: '탐색',
  planning: '계획',
  building: '구현',
  review: '검토',
  shipping: '출시',
  archived: '보관',
}

export function GlobalBar({
  project,
  currentRoom,
  pendingCount,
  children,
}: {
  project: Project
  currentRoom: string
  pendingCount: number
  children?: React.ReactNode
}) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-foreground-muted transition-colors duration-200 hover:text-accent"
        >
          <img
            src="/sprites/characters/ceo/south.png"
            alt=""
            width={20}
            height={20}
            className="pixel-art object-contain"
          />
          01 Log Square
        </Link>
        <span className="text-border-hover">/</span>
        <span className="text-sm font-medium text-foreground">{project.name}</span>
        <span className="rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-medium text-accent">
          {PHASE_LABELS[project.phase] ?? project.phase}
        </span>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <ThemeSwitcher />
        <div className="h-4 w-px bg-border" />
        {children}
        <span className="font-medium text-foreground-muted">{currentRoom}</span>
        {pendingCount > 0 && (
          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">
            승인 대기 {pendingCount}
          </span>
        )}
      </div>
    </header>
  )
}
