import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

export const queryDecisions = createTool({
  id: 'query-decisions',
  description:
    '프로젝트의 결정 이력을 조회합니다. 과거 결정, 승인/거부된 사항을 확인할 때 사용하세요.',
  inputSchema: z.object({
    project_id: z.number().describe('프로젝트 ID'),
    status: z
      .enum(['draft', 'pending_review', 'approved', 'rejected', 'superseded'])
      .optional()
      .describe('결정 상태로 필터링'),
    search: z.string().optional().describe('제목에서 키워드 검색'),
    limit: z.number().min(1).max(30).default(10).describe('최대 반환 건수'),
  }),
  execute: async ({ project_id, status, search, limit: rawLimit }) => {
    const limit = rawLimit ?? 10
    const supabase = createServerClient()
    let query = supabase
      .from('decisions')
      .select('id, title, summary_md, status, review_status, created_at')
      .eq('project_id', project_id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw new Error(`Supabase error: ${error.message}`)

    return { decisions: data ?? [], count: (data ?? []).length }
  },
})
