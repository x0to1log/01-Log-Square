import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getProjectOwner } from './helpers'

export const createNote = createTool({
  id: 'create-note',
  description:
    '프로젝트에 노트를 초안으로 생성합니다. 회의록, 브리프, SOP, 참고자료 등을 기록할 때 사용하세요.',
  inputSchema: z.object({
    project_id: z.number().describe('프로젝트 ID'),
    title: z.string().describe('노트 제목'),
    body_md: z.string().describe('노트 본문 (마크다운)'),
    note_type: z
      .enum(['meeting_note', 'brief', 'reference', 'summary', 'sop', 'journal'])
      .describe('노트 유형'),
  }),
  execute: async ({ project_id, title, body_md, note_type }) => {
    const ownerUserId = await getProjectOwner(project_id)
    const supabase = createServerClient()

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        owner_user_id: ownerUserId,
        project_id,
        note_type,
        title,
        body_md,
        status: 'draft',
        latest_revision_no: 1,
        pinned: false,
      })
      .select('id, title, note_type, status')
      .single()

    if (error) throw new Error(`노트 생성 실패: ${error.message}`)

    // Create initial revision
    await supabase.from('note_revisions').insert({
      owner_user_id: ownerUserId,
      note_id: note.id,
      revision_no: 1,
      body_md,
      summary: title,
      saved_by_type: 'system',
    })

    return {
      note,
      message: `노트 "${title}"이(가) 초안으로 생성되었습니다.`,
    }
  },
})
