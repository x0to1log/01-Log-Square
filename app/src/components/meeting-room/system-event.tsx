import type { Message } from '@/lib/types/database'

export function SystemEvent({ message }: { message: Message }) {
  const isRedFlag = message.body_md.toLowerCase().includes('red flag')
  const isBlocked = message.body_md.toLowerCase().includes('blocked')

  return (
    <div className="flex items-center gap-2 py-1">
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      <p
        className={`text-xs font-medium ${
          isRedFlag
            ? 'text-red-600 dark:text-red-400'
            : isBlocked
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-zinc-400'
        }`}
      >
        {message.body_md}
      </p>
      <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
    </div>
  )
}
