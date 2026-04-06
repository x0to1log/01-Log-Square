import type { Review } from '@/lib/types/database'

const SEVERITY_COLORS: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  critical: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export function RiskCard({ risks }: { risks: Review[] }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Open Risks
      </h3>

      {risks.length === 0 ? (
        <p className="text-sm text-zinc-400">열린 리스크 없음</p>
      ) : (
        <div className="flex flex-col gap-2">
          {risks.map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{r.title}</p>
                {r.severity && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_COLORS[r.severity] ?? ''}`}>
                    {r.severity}
                  </span>
                )}
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{r.summary}</p>
              {r.result === 'blocked' && (
                <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                  BLOCKED — 대표 승인 필요
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
