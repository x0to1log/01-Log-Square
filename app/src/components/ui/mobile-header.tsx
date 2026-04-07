'use client'

import { useState } from 'react'
import { MobileDrawer } from './mobile-drawer'
import { useViewMode } from './view-mode-context'

export function MobileHeader({
  title,
  leftDrawerContent,
  rightDrawerContent,
}: {
  title: string
  leftDrawerContent: React.ReactNode
  rightDrawerContent: React.ReactNode
}) {
  const [leftOpen, setLeftOpen] = useState(false)
  const [rightOpen, setRightOpen] = useState(false)
  const { mode, toggle } = useViewMode()

  return (
    <>
      {/* Mobile top bar — only visible ≤1024px */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3 lg:hidden">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLeftOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-hover"
            aria-label="에이전트 목록 열기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          <button
            onClick={toggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-hover"
            aria-label={mode === 'conversation' ? '오피스 맵 보기' : '대화로 돌아가기'}
          >
            {mode === 'conversation' ? (
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="1" y="1" width="5" height="5" rx="1" />
                <rect x="8" y="1" width="5" height="5" rx="1" />
                <rect x="1" y="8" width="5" height="5" rx="1" />
                <rect x="8" y="8" width="5" height="5" rx="1" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 3h12M1 7h8M1 11h10" />
              </svg>
            )}
          </button>
        </div>

        <span className="text-sm font-semibold">{title}</span>

        <button
          onClick={() => setRightOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:bg-surface-hover"
          aria-label="운영 패널 열기"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h5v5H4zM11 4h5v5h-5zM4 11h5v5H4zM11 11h5v5h-5z" />
          </svg>
        </button>
      </div>

      {/* Left drawer: thread sidebar */}
      <MobileDrawer open={leftOpen} side="left" onClose={() => setLeftOpen(false)}>
        {leftDrawerContent}
      </MobileDrawer>

      {/* Right drawer: operations panel */}
      <MobileDrawer open={rightOpen} side="right" onClose={() => setRightOpen(false)}>
        {rightDrawerContent}
      </MobileDrawer>
    </>
  )
}
