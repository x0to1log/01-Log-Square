import { z } from 'zod'

export const ReviewCandidateSchema = z.object({
  review_kind: z.enum(['risk', 'verification']),
  title: z.string().describe('리뷰 제목'),
  summary: z.string().describe('핵심 요약'),
  details_md: z.string().describe('상세 내용 마크다운'),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  result: z.enum(['warning', 'pass', 'fail', 'blocked']).default('warning'),
})

export type ReviewCandidate = z.infer<typeof ReviewCandidateSchema>
