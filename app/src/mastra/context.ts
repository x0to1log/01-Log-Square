import { createServerClient } from '@/lib/supabase/server'
import type {
  Project,
  Decision,
  ActionItem,
  Note,
  Review,
} from '@/lib/types/database'

export interface ProjectContext {
  project: Project
  decisions: Decision[]
  actionItems: ActionItem[]
  notes: Note[]
  reviews: Review[]
  otherProjects: Pick<Project, 'id' | 'name' | 'description' | 'status' | 'phase'>[]
}

/**
 * Loads all operational context for a project:
 * decisions, action items, notes, and reviews.
 * This gets injected into every agent's prompt so they can
 * reason about the project's history and current state.
 */
export async function loadProjectContext(projectId: number): Promise<ProjectContext> {
  const supabase = createServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single() as { data: Project | null }

  if (!project) throw new Error(`Project ${projectId} not found`)

  const { data: decisions } = await supabase
    .from('decisions')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(20) as { data: Decision[] | null }

  const { data: actionItems } = await supabase
    .from('action_items')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(30) as { data: ActionItem[] | null }

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', projectId)
    .neq('status', 'archived')
    .order('updated_at', { ascending: false })
    .limit(15) as { data: Note[] | null }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(20) as { data: Review[] | null }

  // Load other projects (for portfolio awareness)
  const { data: otherProjects } = await supabase
    .from('projects')
    .select('id, name, description, status, phase')
    .neq('id', projectId)
    .neq('status', 'archived')
    .order('last_opened_at', { ascending: false, nullsFirst: false })
    .limit(10) as { data: Pick<Project, 'id' | 'name' | 'description' | 'status' | 'phase'>[] | null }

  return {
    project,
    decisions: decisions ?? [],
    actionItems: actionItems ?? [],
    notes: notes ?? [],
    reviews: reviews ?? [],
    otherProjects: otherProjects ?? [],
  }
}

/**
 * Formats project context into a markdown string
 * suitable for injection into agent system prompts.
 */
export function formatProjectContext(ctx: ProjectContext): string {
  const sections: string[] = []

  // Project overview
  sections.push(`## 프로젝트: ${ctx.project.name}
- 상태: ${ctx.project.status}
- 단계: ${ctx.project.phase}
- 설명: ${ctx.project.description ?? '(없음)'}`)

  // Decisions
  if (ctx.decisions.length > 0) {
    const items = ctx.decisions.map((d) => {
      const status = STATUS_KO.decision[d.status] ?? d.status
      return `  - [${status}] ${d.title}: ${d.summary_md.slice(0, 200)}`
    })
    sections.push(`## 결정 이력 (최근 ${ctx.decisions.length}건)\n${items.join('\n')}`)
  }

  // Action items
  if (ctx.actionItems.length > 0) {
    const open = ctx.actionItems.filter((a) => a.status !== 'done' && a.status !== 'cancelled')
    const done = ctx.actionItems.filter((a) => a.status === 'done')
    const lines: string[] = []

    if (open.length > 0) {
      lines.push('### 열린 액션')
      for (const a of open) {
        const pri = `[${a.priority}]`
        const status = STATUS_KO.action[a.status] ?? a.status
        lines.push(`  - ${pri} ${a.title} (${status})`)
      }
    }
    if (done.length > 0) {
      lines.push(`### 완료된 액션 (최근 ${done.length}건)`)
      for (const a of done.slice(0, 10)) {
        lines.push(`  - ✓ ${a.title}`)
      }
    }
    sections.push(`## 액션 아이템\n${lines.join('\n')}`)
  }

  // Project brief (pinned brief note — most important context)
  const brief = ctx.notes.find((n) => n.note_type === 'brief' && n.pinned)
  if (brief) {
    sections.push(`## 프로젝트 브리프\n${brief.body_md}`)
  }

  // Notes (meeting notes, SOPs, briefs)
  const otherNotes = ctx.notes.filter((n) => n !== brief)
  if (otherNotes.length > 0) {
    const items = otherNotes.map((n) => {
      const type = STATUS_KO.noteType[n.note_type] ?? n.note_type
      return `  - [${type}] ${n.title}${n.pinned ? ' 📌' : ''}`
    })
    sections.push(`## 노트/문서 (${otherNotes.length}건)\n${items.join('\n')}`)
  }

  // Reviews (risks + verifications)
  if (ctx.reviews.length > 0) {
    const openReviews = ctx.reviews.filter((r) => r.status === 'open')
    if (openReviews.length > 0) {
      const items = openReviews.map((r) => {
        const sev = r.severity ? `[${r.severity}]` : ''
        const kind = r.review_kind === 'risk' ? '🔴 리스크' : '✅ 검증'
        return `  - ${kind} ${sev} ${r.title}: ${r.summary}`
      })
      sections.push(`## 열린 리뷰 (${openReviews.length}건)\n${items.join('\n')}`)
    }
  }

  if (sections.length <= 1) {
    sections.push('\n(아직 결정, 액션, 노트, 리뷰 기록이 없습니다. 새 프로젝트입니다.)')
  }

  // Portfolio awareness — other projects the CEO is running
  if (ctx.otherProjects.length > 0) {
    const items = ctx.otherProjects.map((p) => {
      const status = STATUS_KO.projectStatus[p.status] ?? p.status
      const phase = STATUS_KO.projectPhase[p.phase] ?? p.phase
      return `  - **${p.name}** (${status}, ${phase})${p.description ? `: ${p.description}` : ''}`
    })
    sections.push(`## 대표의 다른 프로젝트 (참고용)\n대표는 현재 프로젝트 외에 ${ctx.otherProjects.length}개 프로젝트를 운영 중이에요. 일정이나 리소스 논의 시 참고하세요.\n${items.join('\n')}`)
  }

  return sections.join('\n\n')
}

const STATUS_KO = {
  decision: {
    draft: '초안',
    pending_review: '검토대기',
    approved: '승인됨',
    rejected: '거부됨',
    superseded: '대체됨',
  } as Record<string, string>,
  action: {
    open: '미착수',
    in_progress: '진행중',
    blocked: '차단됨',
    done: '완료',
    cancelled: '취소',
  } as Record<string, string>,
  noteType: {
    meeting_note: '회의록',
    brief: '브리프',
    reference: '참고자료',
    summary: '요약',
    sop: 'SOP',
    journal: '일지',
  } as Record<string, string>,
  projectStatus: {
    active: '진행 중',
    paused: '일시중지',
    archived: '보관됨',
    completed: '완료',
  } as Record<string, string>,
  projectPhase: {
    discovery: '탐색',
    planning: '기획',
    building: '구현',
    review: '검토',
    shipping: '출시',
    archived: '보관',
  } as Record<string, string>,
}
