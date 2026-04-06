'use client'

import { useEffect, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types/database'

/**
 * Subscribes to realtime message updates for a thread.
 * Returns new messages that arrive after the initial load.
 */
export function useRealtimeMessages(threadId: number) {
  const [newMessages, setNewMessages] = useState<Message[]>([])

  useEffect(() => {
    const supabase = getSupabaseClient()

    const channel = supabase
      .channel(`messages:thread:${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          setNewMessages((prev) => [...prev, payload.new as Message])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [threadId])

  return newMessages
}
