import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getProjectOwner } from './helpers'

export const createDecision = createTool({
  id: 'create-decision',
  description:
    '프로젝트에 결정 사항을 초안으로 생성합니다. 대표의 승인이 필요합니다. 논의가 정리되어 결정이 필요할 때 사용하세요.',
  inputSchema: z.object({
    project_id: z.number().describe('프로젝트 ID'),
    title: z.string().describe('결정 제목 (한 줄 요약)'),
    summary_md: z.string().describe('결정 내용 (마크다운)'),
  }),
  execute: async ({ project_id, title, summary_md }) => {
    const ownerUserId = await getProjectOwner(project_id)
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from('decisions')
      .insert({
        owner_user_id: ownerUserId,
        project_id,
        title,
        summary_md,
        status: 'draft',
        review_status: 'not_requested',
      })
      .select('id, title, status')
      .single()

    if (error) throw new Error(`결정 생성 실패: ${error.message}`)

    return {
      decision: data,
      message: `결정 "${title}"이(가) 초안으로 생성되었습니다. 대표의 승인이 필요합니다.`,
    }
  },
})
