import { z } from 'zod'

export const DecisionCandidateSchema = z.object({
  title: z.string().describe('결정 제목 (한 줄 요약)'),
  summary_md: z.string().describe('결정 내용 마크다운'),
  status: z.enum(['draft', 'pending_review']).default('draft'),
})

export type DecisionCandidate = z.infer<typeof DecisionCandidateSchema>
