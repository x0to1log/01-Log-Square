'use client'

import { useViewMode } from './view-mode-context'

export function ViewModeToggle() {
  const { mode, toggle } = useViewMode()

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground-muted transition-colors hover:bg-surface-hover"
    >
      {mode === 'conversation' ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="5" height="5" rx="1" />
            <rect x="8" y="1" width="5" height="5" rx="1" />
            <rect x="1" y="8" width="5" height="5" rx="1" />
            <rect x="8" y="8" width="5" height="5" rx="1" />
          </svg>
          오피스 맵
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 3h12M1 7h8M1 11h10" />
          </svg>
          대화로 돌아가기
        </>
      )}
    </button>
  )
}
