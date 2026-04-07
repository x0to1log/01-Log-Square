import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const webSearch = createTool({
  id: 'web-search',
  description:
    '인터넷에서 최신 정보를 검색합니다. 기술 트렌드, 경쟁사 동향, 시장 조사, 일반 지식 등을 찾을 때 사용하세요.',
  inputSchema: z.object({
    query: z.string().describe('검색어 (영어 또는 한국어)'),
  }),
  outputSchema: z.object({
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        description: z.string(),
      }),
    ),
  }),
  execute: async ({ query }) => {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY
    if (!apiKey) throw new Error('BRAVE_SEARCH_API_KEY is not set')

    const params = new URLSearchParams({
      q: query,
      count: '5',
    })

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      },
    )

    if (!response.ok) throw new Error(`Brave Search API error: ${response.status}`)
    const data = await response.json()

    return {
      results: (data.web?.results ?? []).slice(0, 5).map((r: Record<string, unknown>) => ({
        title: (r.title as string) ?? '',
        url: (r.url as string) ?? '',
        description: (r.description as string) ?? '',
      })),
    }
  },
})
