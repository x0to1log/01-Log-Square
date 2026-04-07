import Markdown from 'react-markdown'
import type { Message } from '@/lib/types/database'
import { AgentProfilePopover } from '@/components/ui/agent-profile-popover'

export function MessageBubble({
  message,
  agentMap,
  projectId,
}: {
  message: Message
  agentMap?: Record<number, { name: string; role_title: string; key?: string }>
  projectId?: number
}) {
  const isRepresentative = message.sender_type === 'representative'
  const isSystem = message.sender_type === 'system'

  const agentInfo =
    message.sender_type === 'agent' && message.sender_agent_instance_id
      ? agentMap?.[message.sender_agent_instance_id]
      : null

  const senderName = isRepresentative
    ? '대표'
    : agentInfo?.name ?? (isSystem ? 'System' : 'Agent')

  const time = new Date(message.created_at).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // System messages (help, status, etc.) — full width, no avatar, card style
  if (isSystem) {
    return (
      <div className="rounded-lg border border-border bg-surface px-4 py-3">
        <div className="prose prose-sm max-w-none prose-headings:mb-1 prose-headings:mt-2 prose-headings:text-xs prose-headings:font-semibold prose-headings:text-foreground prose-p:my-1 prose-p:text-foreground prose-ul:my-1 prose-li:my-0.5 prose-li:text-foreground prose-strong:text-foreground prose-code:rounded prose-code:bg-surface-active prose-code:px-1.5 prose-code:py-0.5 prose-code:text-xs prose-code:font-normal prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none">
          <Markdown>{message.body_md}</Markdown>
        </div>
      </div>
    )
  }

  const avatarImg = (
    <img
      src={
        isRepresentative
          ? '/sprites/characters/ceo/south.png'
          : agentInfo?.key
            ? `/sprites/characters/${agentInfo.key}/south.png`
            : undefined
      }
      alt={senderName}
      className="h-8 w-8 rounded-lg object-contain"
      style={{ imageRendering: 'pixelated' }}
    />
  )

  const avatarPlaceholder = (
    <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-700" />
  )

  const renderAvatar = () => {
    if (isRepresentative) {
      return <div className="mt-1 shrink-0">{avatarImg}</div>
    }
    if (agentInfo?.key) {
      return (
        <div className="mt-1 shrink-0">
          <AgentProfilePopover
            agentKey={agentInfo.key}
            agentName={agentInfo.name}
            roleTitle={agentInfo.role_title}
            projectId={projectId}
          >
            {avatarImg}
          </AgentProfilePopover>
        </div>
      )
    }
    return <div className="mt-1 shrink-0">{avatarPlaceholder}</div>
  }

  return (
    <div className={`flex gap-3 ${isRepresentative ? 'flex-row-reverse' : ''}`}>
      {renderAvatar()}

      <div className={`${isRepresentative ? 'max-w-[70%]' : 'max-w-[85%]'}`}>
        <div className="mb-0.5 flex items-center gap-2 text-xs text-foreground-muted">
          {isRepresentative ? (
            <span className="font-medium text-accent">대표</span>
          ) : (
            <span className="font-medium text-foreground">{senderName}</span>
          )}
          {agentInfo?.role_title && (
            <span className="text-foreground-muted/50">{agentInfo.role_title}</span>
          )}
          <span>{time}</span>
        </div>

        <div
          className={`rounded-xl px-3 py-2 text-sm leading-relaxed ${
            isRepresentative
              ? 'bg-accent text-background'
              : 'bg-surface text-foreground'
          }`}
        >
          {isRepresentative ? (
            <p className="whitespace-pre-wrap">{message.body_md}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-headings:mb-1 prose-headings:mt-3 prose-headings:text-sm prose-headings:font-semibold prose-headings:text-foreground prose-p:my-1 prose-p:text-foreground prose-ul:my-1 prose-li:my-0.5 prose-li:text-foreground prose-strong:text-foreground">
              <Markdown>{message.body_md}</Markdown>
            </div>
          )}
        </div>

        {message.message_kind !== 'chat' && (
          <span className="mt-0.5 inline-block rounded-full bg-surface-active px-2 py-0.5 text-xs text-foreground-muted">
            {message.message_kind}
          </span>
        )}
      </div>
    </div>
  )
}
