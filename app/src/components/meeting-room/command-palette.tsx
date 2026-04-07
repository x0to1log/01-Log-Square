'use client'

import { useEffect, useRef, useState } from 'react'
import { filterCommands, getCategoryLabel, type SlashCommand } from '@/lib/commands'

export function CommandPalette({
  query,
  onSelect,
  onClose,
}: {
  query: string
  onSelect: (cmd: SlashCommand) => void
  onClose: () => void
}) {
  const filtered = filterCommands(query)
  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault()
        onSelect(filtered[activeIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [filtered, activeIndex, onSelect, onClose])

  if (filtered.length === 0) {
    return (
      <div className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="text-xs text-foreground-muted">일치하는 커맨드가 없습니다</p>
      </div>
    )
  }

  // Group by category
  const groups = new Map<string, SlashCommand[]>()
  for (const cmd of filtered) {
    const list = groups.get(cmd.category) ?? []
    list.push(cmd)
    groups.set(cmd.category, list)
  }

  let globalIndex = 0

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 right-0 mb-1 max-h-[320px] overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
    >
      {Array.from(groups.entries()).map(([category, cmds]) => (
        <div key={category}>
          <div className="sticky top-0 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
            {getCategoryLabel(category)}
          </div>
          {cmds.map((cmd) => {
            const idx = globalIndex++
            return (
              <button
                key={cmd.key}
                data-index={idx}
                onClick={() => onSelect(cmd)}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  idx === activeIndex
                    ? 'bg-accent-muted'
                    : 'hover:bg-surface-hover'
                } ${!cmd.available ? 'opacity-50' : ''}`}
              >
                <span className="shrink-0 font-mono text-xs font-semibold text-accent">
                  {cmd.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-foreground-muted">
                  {cmd.description}
                </span>
                {!cmd.available && (
                  <span className="shrink-0 rounded bg-surface px-1.5 py-0.5 text-[10px] text-foreground-muted">
                    soon
                  </span>
                )}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
