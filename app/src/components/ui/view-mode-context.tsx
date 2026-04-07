'use client'

import { createContext, useContext, useState } from 'react'

type ViewMode = 'conversation' | 'map'

const ViewModeContext = createContext<{
  mode: ViewMode
  setMode: (mode: ViewMode) => void
  toggle: () => void
}>({
  mode: 'conversation',
  setMode: () => {},
  toggle: () => {},
})

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('conversation')
  const toggle = () => setMode((m) => (m === 'conversation' ? 'map' : 'conversation'))
  return (
    <ViewModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  return useContext(ViewModeContext)
}
