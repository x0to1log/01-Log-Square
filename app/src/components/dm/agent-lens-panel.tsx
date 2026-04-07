import type { AgentInstance } from '@/lib/types/database'

export function AgentLensPanel({ agent }: { agent: AgentInstance }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          Agent Lens
        </h3>
        <div className="rounded-lg border border-border p-3">
          <p className="text-sm font-medium">{agent.name}</p>
          <p className="text-xs text-foreground-muted">{agent.role_title}</p>
          <p className="mt-2 text-xs text-foreground-muted">
            이 에이전트의 관점으로 프로젝트를 분석합니다.
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          Draft Output
        </h3>
        <p className="text-sm text-foreground-muted">작성 중인 초안 없음</p>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted">
          Suggested Actions
        </h3>
        <p className="text-sm text-foreground-muted">제안된 액션 없음</p>
      </section>
    </div>
  )
}
