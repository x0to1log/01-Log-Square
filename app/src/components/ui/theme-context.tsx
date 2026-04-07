'use client'

import { createContext, useContext, useState, useEffect } from 'react'

export type ThemeId = 'default' | 'dark' | 'light' | 'midnight' | 'pink'

export const THEMES: { id: ThemeId; label: string; color: string }[] = [
  { id: 'default', label: 'Default', color: '#007AFF' },
  { id: 'dark', label: 'Dark', color: '#181412' },
  { id: 'light', label: 'Light', color: '#F4F1EA' },
  { id: 'midnight', label: 'Midnight', color: '#08090E' },
  { id: 'pink', label: 'Pink', color: '#FFF5F7' },
]

const ThemeContext = createContext<{
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
  cycle: () => void
}>({
  theme: 'dark',
  setTheme: () => {},
  cycle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('default')

  useEffect(() => {
    const stored = localStorage.getItem('sq-theme') as ThemeId | null
    if (stored && THEMES.some((t) => t.id === stored)) {
      setThemeState(stored)
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('sq-theme', theme)

    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]')
    const color = THEMES.find((t) => t.id === theme)?.color ?? '#0A0A0A'
    if (meta) {
      meta.setAttribute('content', color)
    } else {
      const newMeta = document.createElement('meta')
      newMeta.name = 'theme-color'
      newMeta.content = color
      document.head.appendChild(newMeta)
    }
  }, [theme])

  const setTheme = (t: ThemeId) => setThemeState(t)

  const cycle = () => {
    const idx = THEMES.findIndex((t) => t.id === theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    setTheme(next.id)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
