'use client'

import { useTheme } from './theme-context'
import type { ThemeId } from './theme-context'

const CYCLE_ORDER: ThemeId[] = ['default', 'dark', 'light', 'midnight', 'pink']

const THEME_ICONS: Record<ThemeId, React.ReactNode> = {
  default: (
    // Chat bubble (iMessage style)
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6l-3 3v-3a2 2 0 01-1-1.73V3z" />
    </svg>
  ),
  dark: (
    // Crescent moon
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 8.5a5.5 5.5 0 1 1-7-7 4.5 4.5 0 0 0 7 7z" />
    </svg>
  ),
  light: (
    // Sun
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3" />
      <path d="M8 1.5v1.5M8 13v1.5M2.75 2.75l1.06 1.06M12.19 12.19l1.06 1.06M1.5 8H3M13 8h1.5M2.75 13.25l1.06-1.06M12.19 3.81l1.06-1.06" />
    </svg>
  ),
  midnight: (
    // Stars
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" stroke="none">
      <path d="M6 1l.74 2.26L9 4l-2.26.74L6 7l-.74-2.26L3 4l2.26-.74L6 1z" />
      <path d="M11 7l.5 1.5L13 9l-1.5.5L11 11l-.5-1.5L9 9l1.5-.5L11 7z" />
      <path d="M5 10l.37 1.13L6.5 11.5l-1.13.37L5 13l-.37-1.13L3.5 11.5l1.13-.37L5 10z" opacity="0.6" />
    </svg>
  ),
  pink: (
    // Flower
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="5" r="2" />
      <circle cx="5.2" cy="7.8" r="2" />
      <circle cx="10.8" cy="7.8" r="2" />
      <circle cx="6.2" cy="10.8" r="2" />
      <circle cx="9.8" cy="10.8" r="2" />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
    </svg>
  ),
}

const THEME_LABELS: Record<ThemeId, string> = {
  default: 'Default',
  dark: 'Dark',
  light: 'Light',
  midnight: 'Midnight',
  pink: 'Pink',
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const cycle = () => {
    const idx = CYCLE_ORDER.indexOf(theme)
    const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length]
    setTheme(next)
  }

  return (
    <button
      onClick={cycle}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-foreground-muted transition-colors duration-200 hover:bg-surface-hover hover:text-accent"
      aria-label={`테마 변경 (현재: ${THEME_LABELS[theme]})`}
      title={THEME_LABELS[theme]}
    >
      {THEME_ICONS[theme]}
    </button>
  )
}
