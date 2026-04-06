'use client'

import type { Decision } from '@/lib/types/database'

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  pending_review: '검토 대기',
  approved: '승인됨',
  rejected: '반려',
  superseded: '대체됨',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'text-zinc-500',
  pending_review: 'text-amber-600 dark:text-amber-400',
  approved: 'text-emerald-600 dark:text-emerald-400',
  rejected: 'text-red-600 dark:text-red-400',
}

export function DecisionCard({
  decisions,
  projectId,
}: {
  decisions: Decision[]
  projectId: number
}) {
  async function handleApprove(decisionId: number) {
    await fetch(`/api/projects/${projectId}/decisions/${decisionId}/approve`, {
      method: 'POST',
    })
    window.location.reload()
  }

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Current Decisions
      </h3>

      {decisions.length === 0 ? (
        <p className="text-sm text-zinc-400">열린 결정 없음</p>
      ) : (
        <div className="flex flex-col gap-2">
          {decisions.map((d) => (
            <div
              key={d.id}
              className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{d.title}</p>
                <span className={`shrink-0 text-xs font-medium ${STATUS_COLORS[d.status] ?? ''}`}>
                  {STATUS_LABELS[d.status] ?? d.status}
                </span>
              </div>
              {d.summary_md && (
                <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{d.summary_md}</p>
              )}
              {d.status === 'pending_review' && (
                <button
                  onClick={() => handleApprove(d.id)}
                  className="mt-2 rounded-md bg-emerald-600 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-700"
                >
                  승인
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
