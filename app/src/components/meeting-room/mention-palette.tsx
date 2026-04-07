'use client'

import { useEffect, useRef, useState } from 'react'

export interface AgentOption {
  key: string
  name: string
  role_title: string
}

const ALL_OPTION: AgentOption = {
  key: 'all',
  name: '전체',
  role_title: '코어 에이전트 전원 호출',
}

export function MentionPalette({
  query,
  agents,
  onSelect,
  onClose,
}: {
  query: string // text after @
  agents: AgentOption[]
  onSelect: (agent: AgentOption) => void
  onClose: () => void
}) {
  const q = query.toLowerCase()
  const options = [ALL_OPTION, ...agents]
  const filtered = q
    ? options.filter(
        (a) =>
          a.key.includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.role_title.toLowerCase().includes(q),
      )
    : options

  const [activeIndex, setActiveIndex] = useState(0)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

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
        <p className="text-xs text-foreground-muted">일치하는 에이전트가 없습니다</p>
      </div>
    )
  }

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 right-0 mb-1 max-h-[320px] overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
    >
      <div className="sticky top-0 bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
        에이전트 멘션
      </div>
      {filtered.map((agent, idx) => (
        <button
          key={agent.key}
          data-index={idx}
          onClick={() => onSelect(agent)}
          className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
            idx === activeIndex
              ? 'bg-accent-muted'
              : 'hover:bg-surface-hover'
          }`}
        >
          {agent.key === 'all' ? (
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-surface-active text-xs">
              @
            </div>
          ) : (
            <img
              src={`/sprites/characters/${agent.key}/south.png`}
              alt={agent.name}
              className="pixel-art h-6 w-6 shrink-0 rounded-sm object-contain"
            />
          )}
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold">{agent.name}</span>
            <span className="ml-2 text-xs text-foreground-muted">{agent.role_title}</span>
          </div>
        </button>
      ))}
    </div>
  )
}
