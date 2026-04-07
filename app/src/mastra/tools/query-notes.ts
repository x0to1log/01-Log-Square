import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

export const queryNotes = createTool({
  id: 'query-notes',
  description:
    '프로젝트의 노트와 문서를 조회합니다. 회의록, 브리프, SOP, 참고자료를 찾을 때 사용하세요.',
  inputSchema: z.object({
    project_id: z.number().describe('프로젝트 ID'),
    note_type: z
      .enum(['meeting_note', 'brief', 'reference', 'summary', 'sop', 'journal'])
      .optional()
      .describe('노트 유형으로 필터링'),
    search: z.string().optional().describe('제목에서 키워드 검색'),
    limit: z.number().min(1).max(20).default(10).describe('최대 반환 건수'),
  }),
  execute: async ({ project_id, note_type, search, limit: rawLimit }) => {
    const limit = rawLimit ?? 10
    const supabase = createServerClient()
    let query = supabase
      .from('notes')
      .select('id, title, body_md, note_type, status, pinned, created_at, updated_at')
      .eq('project_id', project_id)
      .neq('status', 'archived')
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (note_type) query = query.eq('note_type', note_type)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error } = await query
    if (error) throw new Error(`Supabase error: ${error.message}`)

    return { notes: data ?? [], count: (data ?? []).length }
  },
})
