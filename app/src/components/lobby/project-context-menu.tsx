'use client'

import { useEffect, useRef } from 'react'

export function ProjectContextMenu({
  x,
  y,
  onEdit,
  onClose,
}: {
  x: number
  y: number
  onEdit: () => void
  onClose: () => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', escHandler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', escHandler)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] rounded-lg border border-border bg-background py-1 shadow-lg"
      style={{ left: x, top: y }}
    >
      <button
        onClick={onEdit}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-surface-hover"
      >
        <span className="text-xs">✏️</span>
        프로젝트 수정
      </button>
    </div>
  )
}
