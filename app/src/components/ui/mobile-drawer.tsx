'use client'

import { useEffect } from 'react'

export function MobileDrawer({
  open,
  side,
  onClose,
  children,
}: {
  open: boolean
  side: 'left' | 'right'
  onClose: () => void
  children: React.ReactNode
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 z-50 h-full w-[300px] bg-background transition-transform duration-200 ${
          side === 'left' ? 'left-0' : 'right-0'
        } ${
          open
            ? 'translate-x-0'
            : side === 'left'
              ? '-translate-x-full'
              : 'translate-x-full'
        }`}
      >
        {children}
      </div>
    </>
  )
}
