'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Message } from '@/lib/types/database'
import { MessageBubble } from './message-bubble'
import { SystemEvent } from './system-event'
import { MessageInput } from './message-input'

export function MessageTimeline({
  messages: serverMessages,
  threadId,
  projectId,
  mode,
  agentKey,
  agentMap,
}: {
  messages: Message[]
  threadId: number
  projectId: number
  mode: 'meeting-room' | 'dm'
  agentKey?: string
  agentMap?: Record<number, { name: string; role_title: string; key?: string }>
}) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const [polledMessages, setPolledMessages] = useState<Message[]>([])
  const [isWaitingForAgent, setIsWaitingForAgent] = useState(false)
  const [cleared, setCleared] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Merge all message sources, dedup by id
  const allMessages = useMemo(() => {
    const map = new Map<number, Message>()
    if (!cleared) {
      for (const m of serverMessages) map.set(m.id, m)
    }
    for (const m of polledMessages) map.set(m.id, m)
    // Optimistic messages have negative IDs — only show if not yet in server/polled
    const result = Array.from(map.values())
    for (const m of optimisticMessages) {
      const alreadyExists = result.some(
        (r) =>
          r.sender_type === 'representative' &&
          r.body_md === m.body_md &&
          Math.abs(new Date(r.created_at).getTime() - new Date(m.created_at).getTime()) < 10000,
      )
      if (!alreadyExists) result.push(m)
    }
    result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    return result
  }, [serverMessages, polledMessages, optimisticMessages, cleared])

  // Auto-scroll: instant on first load, smooth on new messages
  const initialLoad = useRef(true)
  useEffect(() => {
    if (initialLoad.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
      initialLoad.current = false
    } else {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [allMessages.length])

  // Mark thread as read on mount and when new messages arrive
  useEffect(() => {
    fetch(`/api/threads/${threadId}/read`, { method: 'POST' }).catch(() => {})
  }, [threadId, allMessages.length])

  // Poll for new messages when waiting for agent response
  useEffect(() => {
    if (!isWaitingForAgent) return

    const lastId = Math.max(
      ...serverMessages.map((m) => m.id),
      ...polledMessages.map((m) => m.id),
      0,
    )

    let emptyPollsAfterReply = 0
    let gotFirstReply = false

    const poll = async () => {
      try {
        const res = await fetch(
          `/api/threads/${threadId}/messages?after=${lastId}`,
        )
        if (!res.ok) return
        const newMsgs: Message[] = await res.json()
        if (newMsgs.length > 0) {
          emptyPollsAfterReply = 0
          setPolledMessages((prev) => {
            const ids = new Set(prev.map((m) => m.id))
            return [...prev, ...newMsgs.filter((m) => !ids.has(m.id))]
          })

          const hasAgentReply = newMsgs.some(
            (m) => m.sender_type === 'agent' || m.sender_type === 'system',
          )
          if (hasAgentReply) {
            gotFirstReply = true
            if (mode === 'dm') {
              // DM: single agent, stop immediately
              setIsWaitingForAgent(false)
              setOptimisticMessages([])
            }
          }
        } else if (gotFirstReply) {
          // No new messages after we already got agent replies
          emptyPollsAfterReply++
          if (emptyPollsAfterReply >= 3) {
            // 3 empty polls (~9s) after last agent reply → all agents done
            setIsWaitingForAgent(false)
            setOptimisticMessages([])
          }
        }
      } catch {
        // Ignore poll errors
      }
    }

    pollRef.current = setInterval(poll, 3000)
    poll()

    // Safety timeout: stop after 3 minutes regardless
    const timeout = setTimeout(() => {
      setIsWaitingForAgent(false)
      setOptimisticMessages([])
    }, 180000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      clearTimeout(timeout)
    }
  }, [isWaitingForAgent, threadId, serverMessages, polledMessages, mode])

  const handleOptimisticMessage = useCallback((msg: Message) => {
    setOptimisticMessages((prev) => [...prev, msg])
    setIsWaitingForAgent(true)
  }, [])

  // For local-only messages (like /help, /status) — no polling, no typing indicator
  const handleLocalMessage = useCallback((msg: Message) => {
    setPolledMessages((prev) => [...prev, msg])
  }, [])

  // Clear all messages from view (DB messages reappear on refresh)
  const handleClear = useCallback(() => {
    setOptimisticMessages([])
    setPolledMessages([])
    setIsWaitingForAgent(false)
    setCleared(true)
  }, [])

  if (allMessages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center text-sm text-foreground-muted">
          아직 대화가 없습니다. 첫 메시지를 보내보세요.
        </div>
        <MessageInput
          projectId={projectId}
          threadId={threadId}
          mode={mode}
          agentKey={agentKey}
          onOptimisticMessage={handleOptimisticMessage}
          onLocalMessage={handleLocalMessage}
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-[800px] flex-col gap-3">
          {allMessages.map((msg) =>
            msg.message_kind === 'system' ? (
              <SystemEvent key={msg.id} message={msg} />
            ) : (
              <MessageBubble key={msg.id} message={msg} agentMap={agentMap} projectId={projectId} />
            ),
          )}
          {isWaitingForAgent && (
            <div className="flex gap-3">
              <div className="mt-1 h-8 w-8 shrink-0 rounded-lg bg-surface-active" />
              <div className="flex items-center gap-1 rounded-xl bg-surface px-4 py-3">
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground-muted [animation-delay:0ms]" />
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground-muted [animation-delay:150ms]" />
                <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-foreground-muted [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <MessageInput
        projectId={projectId}
        threadId={threadId}
        mode={mode}
        agentKey={agentKey}
        onOptimisticMessage={handleOptimisticMessage}
        onLocalMessage={handleLocalMessage}
      />
    </div>
  )
}
