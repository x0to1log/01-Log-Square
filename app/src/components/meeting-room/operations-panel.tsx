import { createServerClient } from '@/lib/supabase/server'
import type { Decision, ActionItem, Review } from '@/lib/types/database'
import { ProjectBriefCard } from './project-brief-card'
import { DecisionCard } from './decision-card'
import { RiskCard } from './risk-card'
import { ActionCard } from './action-card'
import { NotesCard } from './notes-card'

export async function OperationsPanel({ projectId }: { projectId: number }) {
  const supabase = createServerClient()

  const { data: decisions } = await supabase
    .from('decisions')
    .select('*')
    .eq('project_id', projectId)
    .in('status', ['draft', 'pending_review'])
    .order('created_at', { ascending: false })
    .limit(3) as { data: Decision[] | null }

  const { data: actions } = await supabase
    .from('action_items')
    .select('*')
    .eq('project_id', projectId)
    .in('status', ['open', 'in_progress', 'blocked'])
    .order('priority')
    .limit(5) as { data: ActionItem[] | null }

  const { data: risks } = await supabase
    .from('reviews')
    .select('*')
    .eq('project_id', projectId)
    .eq('review_kind', 'risk')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(5) as { data: Review[] | null }

  return (
    <div className="flex flex-col gap-4 p-4">
      <ProjectBriefCard projectId={projectId} />
      <DecisionCard decisions={decisions ?? []} projectId={projectId} />
      <RiskCard risks={risks ?? []} />
      <ActionCard actions={actions ?? []} />
      <NotesCard />
    </div>
  )
}
