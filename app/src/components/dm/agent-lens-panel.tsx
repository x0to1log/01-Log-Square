import type { AgentInstance } from '@/lib/types/database'

export function AgentLensPanel({ agent }: { agent: AgentInstance }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Agent Lens
        </h3>
        <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
          <p className="text-sm font-medium">{agent.name}</p>
          <p className="text-xs text-zinc-400">{agent.role_title}</p>
          <p className="mt-2 text-xs text-zinc-500">
            이 에이전트의 관점으로 프로젝트를 분석합니다.
          </p>
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Draft Output
        </h3>
        <p className="text-sm text-zinc-400">작성 중인 초안 없음</p>
      </section>

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Suggested Actions
        </h3>
        <p className="text-sm text-zinc-400">제안된 액션 없음</p>
      </section>
    </div>
  )
}
