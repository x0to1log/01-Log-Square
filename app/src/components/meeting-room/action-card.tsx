import type { ActionItem } from '@/lib/types/database'

const STATUS_LABELS: Record<string, string> = {
  open: '대기',
  in_progress: '진행 중',
  blocked: '차단됨',
  done: '완료',
  cancelled: '취소',
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-zinc-400',
  medium: 'text-blue-500',
  high: 'text-orange-500',
  critical: 'text-red-500',
}

export function ActionCard({ actions }: { actions: ActionItem[] }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Next Actions
      </h3>

      {actions.length === 0 ? (
        <p className="text-sm text-zinc-400">열린 액션 없음</p>
      ) : (
        <div className="flex flex-col gap-2">
          {actions.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <span className={`mt-0.5 text-xs ${PRIORITY_COLORS[a.priority] ?? ''}`}>●</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm">{a.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                  <span>{STATUS_LABELS[a.status] ?? a.status}</span>
                  {a.due_at && (
                    <span>
                      마감: {new Date(a.due_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
