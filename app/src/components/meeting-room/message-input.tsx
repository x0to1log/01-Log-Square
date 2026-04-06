'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Message } from '@/lib/types/database'
import type { SlashCommand } from '@/lib/commands'
import { CommandPalette } from './command-palette'

export function MessageInput({
  projectId,
  threadId,
  mode,
  agentKey,
  onOptimisticMessage,
  onLocalMessage,
}: {
  projectId: number
  threadId: number
  mode: 'meeting-room' | 'dm'
  agentKey?: string
  onOptimisticMessage?: (msg: Message) => void
  onLocalMessage?: (msg: Message) => void
}) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showCommands, setShowCommands] = useState(false)

  // Detect "/" at start of input
  const handleChange = (value: string) => {
    setText(value)
    if (value.startsWith('/') && value.length >= 1) {
      setShowCommands(true)
    } else {
      setShowCommands(false)
    }
  }

  // Helper to show a local-only message (no API call, no polling)
  const showLocalMessage = useCallback(
    (msgText: string) => {
      onLocalMessage?.({
        id: -Date.now(),
        owner_user_id: '',
        thread_id: threadId,
        sender_type: 'system',
        sender_agent_instance_id: null,
        message_kind: 'chat',
        body_md: msgText,
        structured_payload: {},
        reply_to_message_id: null,
        edited_at: null,
        created_at: new Date().toISOString(),
      })
    },
    [threadId, onLocalMessage],
  )

  const handleCommandSelect = useCallback(
    (cmd: SlashCommand) => {
      if (!cmd.available) {
        setShowCommands(false)
        return
      }

      // Navigation commands
      if (cmd.key === 'dm') {
        setText(`/dm `)
        setShowCommands(false)
        return
      }
      if (cmd.key === 'help') {
        setText('')
        setShowCommands(false)
        showLocalMessage(
          '📋 **사용 가능한 커맨드**\n\n' +
          '**에이전트**\n' +
          '- `/call @에이전트` — 특정 에이전트 호출\n' +
          '- `/all 메시지` — 전체 코어 에이전트 호출\n\n' +
          '**프로젝트**\n' +
          '- `/decision 내용` — 결정 사항 기록\n' +
          '- `/action 내용 @담당 마감일` — 액션 아이템 생성\n' +
          '- `/status` — 프로젝트 현황 요약\n\n' +
          '**회의**\n' +
          '- `/summary` — 대화 요약 → 노트 저장\n\n' +
          '**이동**\n' +
          '- `/dm 에이전트` — 1:1 DM으로 이동\n\n' +
          '`/` 입력 시 전체 커맨드 목록을 확인할 수 있습니다.',
        )
        return
      }

      // Commands that need arguments — insert command prefix
      if (['call', 'decision', 'action', 'review', 'compare', 'vote', 'focus', 'log', 'agenda', 'recall'].includes(cmd.key)) {
        setText(`/${cmd.key} `)
        setShowCommands(false)
        return
      }

      // Commands that execute immediately
      if (['all', 'status', 'summary', 'catchup', 'risk', 'deadline', 'portfolio'].includes(cmd.key)) {
        setText(`/${cmd.key}`)
        setShowCommands(false)
        // Auto-submit
        setTimeout(() => {
          const form = document.querySelector('form[data-message-form]') as HTMLFormElement | null
          form?.requestSubmit()
        }, 50)
        return
      }

      setText(`/${cmd.key} `)
      setShowCommands(false)
    },
    [threadId, showLocalMessage],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!text.trim() || loading) return

      setShowCommands(false)
      const body = text.trim()

      // Handle client-side commands (no API call needed)
      if (body === '/help') {
        setText('')
        showLocalMessage(
          '📋 **사용 가능한 커맨드**\n\n' +
          '**에이전트**\n' +
          '- `/call @에이전트` — 특정 에이전트 호출\n' +
          '- `/all 메시지` — 전체 코어 에이전트 호출\n\n' +
          '**프로젝트**\n' +
          '- `/decision 내용` — 결정 사항 기록\n' +
          '- `/action 내용 @담당 마감일` — 액션 아이템 생성\n' +
          '- `/status` — 프로젝트 현황 요약\n\n' +
          '**회의**\n' +
          '- `/summary` — 대화 요약 → 노트 저장\n\n' +
          '**이동**\n' +
          '- `/dm 에이전트` — 1:1 DM으로 이동\n\n' +
          '`/` 입력 시 전체 커맨드 목록을 확인할 수 있습니다.',
        )
        return
      }

      if (body === '/status') {
        setText('')
        showLocalMessage('📊 프로젝트 현황을 불러오는 중...')
        fetch(`/api/projects/${projectId}`)
          .then((r) => r.json())
          .then((data) => {
            const p = data.project
            showLocalMessage(
              `📊 **${p.name}** 현황\n` +
              `- 상태: ${p.status} · 단계: ${p.phase}\n` +
              `- 에이전트: ${data.agents?.length ?? 0}명 · 스레드: ${data.threads?.length ?? 0}개`,
            )
          })
          .catch(() => showLocalMessage('⚠️ 현황 조회 실패'))
        return
      }

      // DM navigation
      if (body.startsWith('/dm ')) {
        const target = body.slice(4).trim()
        if (target) {
          setText('')
          router.push(`/project/${projectId}/dm/${target}`)
          return
        }
      }

      // All other messages (including /call, /all, regular chat) → send to API
      setLoading(true)
      setText('')

      const optimisticMsg: Message = {
        id: -Date.now(),
        owner_user_id: '',
        thread_id: threadId,
        sender_type: 'representative',
        sender_agent_instance_id: null,
        message_kind: 'chat',
        body_md: body,
        structured_payload: {},
        reply_to_message_id: null,
        edited_at: null,
        created_at: new Date().toISOString(),
      }
      onOptimisticMessage?.(optimisticMsg)

      const endpoint =
        mode === 'meeting-room'
          ? '/api/meeting-room'
          : `/api/dm/${agentKey}`

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          thread_id: threadId,
          body_md: body,
        }),
      })
        .then((res) => {
          if (!res.ok) console.error('Send failed:', res.status)
          router.refresh()
        })
        .catch(() => console.error('메시지 전송 실패'))
        .finally(() => setLoading(false))
    },
    [text, loading, threadId, projectId, mode, agentKey, onOptimisticMessage, onLocalMessage, router, showLocalMessage],
  )

  return (
    <form
      data-message-form
      onSubmit={handleSubmit}
      className="relative border-t border-zinc-200 p-4 dark:border-zinc-800"
    >
      {/* Command palette popup */}
      {showCommands && (
        <div className="mx-auto max-w-[800px]">
          <CommandPalette
            query={text}
            onSelect={handleCommandSelect}
            onClose={() => setShowCommands(false)}
          />
        </div>
      )}

      <div className="mx-auto flex max-w-[800px] gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={mode === 'meeting-room' ? '메시지 입력... ( / 로 커맨드 사용)' : 'DM 메시지... ( / 로 커맨드 사용)'}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {loading ? '전송 중...' : '보내기'}
        </button>
      </div>
    </form>
  )
}
