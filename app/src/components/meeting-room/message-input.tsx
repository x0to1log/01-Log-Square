'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Message } from '@/lib/types/database'
import type { SlashCommand } from '@/lib/commands'
import { CommandPalette } from './command-palette'
import { MentionPalette, type AgentOption } from './mention-palette'

const AGENTS: AgentOption[] = [
  { key: 'coo', name: 'COO', role_title: 'Operations Director' },
  { key: 'cso', name: 'CSO', role_title: 'Strategy Planner' },
  { key: 'cto', name: 'CTO', role_title: 'Technical Lead' },
  { key: 'risk_critic', name: 'Risk Critic', role_title: 'Adversarial Reviewer' },
  { key: 'verifier', name: 'Verifier', role_title: 'Verification Lead' },
  { key: 'documentation_manager', name: 'Documentation Manager', role_title: 'Documentation Manager' },
  { key: 'builder', name: 'Builder', role_title: 'Implementation Lead' },
  { key: 'brand_designer', name: 'Brand Designer', role_title: 'Brand Designer' },
  { key: 'content_creator', name: 'Content Creator', role_title: 'Content Creator' },
  { key: 'trend_scout', name: 'Trend Scout', role_title: 'Trend Scout' },
]

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
  const [showCommands, setShowCommands] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }, [text])

  // Detect "/" and "@" in input
  const handleChange = (value: string) => {
    setText(value)

    // Slash commands: only at start of input
    if (value.startsWith('/') && value.length >= 1) {
      setShowCommands(true)
      setShowMentions(false)
      return
    } else {
      setShowCommands(false)
    }

    // @ mentions: detect @word pattern anywhere
    const atMatch = value.match(/@(\w*)$/)
    if (atMatch) {
      setShowMentions(true)
      setMentionQuery(atMatch[1])
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }

  const handleMentionSelect = useCallback(
    (agent: AgentOption) => {
      // Replace the @query with @key
      const newText = text.replace(/@\w*$/, `@${agent.key} `)
      setText(newText)
      setShowMentions(false)
      textareaRef.current?.focus()
    },
    [text],
  )

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

      // Clear command — auto-submit
      if (cmd.key === 'clear') {
        setText('/clear')
        setShowCommands(false)
        setTimeout(() => {
          const form = document.querySelector('form[data-message-form]') as HTMLFormElement | null
          form?.requestSubmit()
        }, 50)
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
      if (!text.trim()) return

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

      if (body === '/clear') {
        setText('')
        // Archive current thread + create new one
        fetch(`/api/threads/${threadId}/clear`, { method: 'POST' })
          .then((r) => r.json())
          .then(() => {
            router.refresh()
          })
          .catch(() => showLocalMessage('⚠️ 대화 초기화 실패'))
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
    },
    [text, threadId, projectId, mode, agentKey, onOptimisticMessage, onLocalMessage, router, showLocalMessage],
  )

  return (
    <form
      data-message-form
      onSubmit={handleSubmit}
      className="relative border-t border-border p-4"
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

      {/* Mention palette popup */}
      {showMentions && (
        <div className="mx-auto max-w-[800px]">
          <MentionPalette
            query={mentionQuery}
            agents={AGENTS}
            onSelect={handleMentionSelect}
            onClose={() => setShowMentions(false)}
          />
        </div>
      )}

      <div className="mx-auto flex max-w-[800px] gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              const form = e.currentTarget.closest('form')
              form?.requestSubmit()
            }
          }}
          placeholder={mode === 'meeting-room' ? '메시지 입력... ( / 로 커맨드 사용)' : 'DM 메시지... ( / 로 커맨드 사용)'}
          rows={1}
          className="max-h-32 min-h-[38px] flex-1 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="shrink-0 self-end rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          보내기
        </button>
      </div>
    </form>
  )
}
