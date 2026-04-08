'use client'

import { useEffect, useState, useCallback } from 'react'

interface UnreadData {
  threads: { thread_id: number; project_id: number | null; title: string; unread_count: number }[]
  projects: Record<number, number>
}

/**
 * Hook to fetch and auto-refresh unread message counts.
 * Polls every 30 seconds.
 */
export function useUnread() {
  const [data, setData] = useState<UnreadData>({ threads: [], projects: {} })

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/unread')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [refresh])

  const getThreadUnread = useCallback(
    (threadId: number) => {
      return data.threads.find((t) => t.thread_id === threadId)?.unread_count ?? 0
    },
    [data],
  )

  const getProjectUnread = useCallback(
    (projectId: number) => {
      return data.projects[projectId] ?? 0
    },
    [data],
  )

  return { data, refresh, getThreadUnread, getProjectUnread }
}
