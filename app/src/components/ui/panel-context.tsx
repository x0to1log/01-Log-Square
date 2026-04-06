'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const PanelContext = createContext<{
  open: boolean
  toggle: () => void
}>({ open: false, toggle: () => {} })

export function PanelProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])

  return (
    <PanelContext.Provider value={{ open, toggle }}>
      {children}
    </PanelContext.Provider>
  )
}

export function usePanel() {
  return useContext(PanelContext)
}
