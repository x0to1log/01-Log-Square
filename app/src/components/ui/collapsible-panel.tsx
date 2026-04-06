'use client'

import { usePanel } from './panel-context'

export function CollapsiblePanel({
  children,
}: {
  children: React.ReactNode
}) {
  const { open } = usePanel()

  return (
    <aside
      className={`hidden shrink-0 overflow-y-auto border-l border-zinc-200 transition-[width] duration-200 lg:block dark:border-zinc-800 ${
        open ? 'w-[340px]' : 'w-0 overflow-hidden border-l-0'
      }`}
    >
      <div className="w-[340px]">
        {children}
      </div>
    </aside>
  )
}
