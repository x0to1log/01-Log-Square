'use client'

import { usePanel } from './panel-context'

export function PanelToggleButton() {
  const { open, toggle } = usePanel()

  return (
    <button
      onClick={toggle}
      className="hidden items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 lg:flex dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
      aria-label={open ? '운영 패널 닫기' : '운영 패널 열기'}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="2" y="2" width="12" height="12" rx="2" />
        <path d="M10 2v12" />
      </svg>
      <span>{open ? '보드 닫기' : '보드'}</span>
    </button>
  )
}
