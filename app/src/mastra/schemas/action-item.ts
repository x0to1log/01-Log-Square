import { z } from 'zod'

export const ActionItemCandidateSchema = z.object({
  title: z.string().describe('액션 아이템 제목'),
  description_md: z.string().describe('상세 설명 마크다운'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assignee_key: z.string().optional().describe('담당 에이전트 key (예: coo, cto)'),
})

export type ActionItemCandidate = z.infer<typeof ActionItemCandidateSchema>
