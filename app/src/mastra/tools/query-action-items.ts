import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

export const queryActionItems = createTool({
  id: 'query-action-items',
  description:
    '프로젝트의 액션 아이템을 조회합니다. 진행 상태, 우선순위, 담당자별로 확인할 때 사용하세요.',
  inputSchema: z.object({
    project_id: z.number().describe('프로젝트 ID'),
    status: z
      .enum(['open', 'in_progress', 'blocked', 'done', 'cancelled'])
      .optional()
      .describe('액션 상태로 필터링'),
    priority: z
      .enum(['low', 'medium', 'high', 'critical'])
      .optional()
      .describe('우선순위로 필터링'),
    limit: z.number().min(1).max(30).default(10).describe('최대 반환 건수'),
  }),
  execute: async ({ project_id, status, priority, limit: rawLimit }) => {
    const limit = rawLimit ?? 10
    const supabase = createServerClient()
    let query = supabase
      .from('action_items')
      .select('id, title, description_md, status, priority, assignee_type, due_at, created_at')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (priority) query = query.eq('priority', priority)

    const { data, error } = await query
    if (error) throw new Error(`Supabase error: ${error.message}`)

    return { actionItems: data ?? [], count: (data ?? []).length }
  },
})
