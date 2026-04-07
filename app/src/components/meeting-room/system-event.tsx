import type { Message } from '@/lib/types/database'

export function SystemEvent({ message }: { message: Message }) {
  const isRedFlag = message.body_md.toLowerCase().includes('red flag')
  const isBlocked = message.body_md.toLowerCase().includes('blocked')

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="h-px flex-1 bg-border" />
      <p
        className={`text-xs font-medium ${
          isRedFlag
            ? 'text-red-600'
            : isBlocked
              ? 'text-amber-600'
              : 'text-foreground-muted'
        }`}
      >
        {message.body_md}
      </p>
      <div className="h-px flex-1 bg-border" />
    </div>
  )
}
