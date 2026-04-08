import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchPage(url: string): Promise<{ title: string; content: string; url: string } | null> {
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': '01LogSquare/1.0' },
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return null

    const html = await response.text()
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i)
    const title = titleMatch?.[1]?.trim() ?? url
    const content = stripHtml(html).slice(0, 5000)

    return { title, content, url }
  } catch {
    return null
  }
}

export const deepResearch = createTool({
  id: 'deep-research',
  description:
    '주제에 대해 심층 리서치를 수행합니다. 웹 검색 후 상위 페이지들을 분석하여 종합적인 정보를 제공합니다. 트렌드 분석, 경쟁사 조사, 기술 리서치에 사용하세요.',
  inputSchema: z.object({
    topic: z.string().describe('조사할 주제 또는 키워드'),
    depth: z
      .number()
      .min(1)
      .max(3)
      .default(2)
      .describe('조사 깊이 (1=상위 1개, 2=상위 3개, 3=상위 5개 페이지 분석)'),
  }),
  execute: async ({ topic, depth: rawDepth }) => {
    const depth = rawDepth ?? 2
    const apiKey = process.env.BRAVE_SEARCH_API_KEY
    if (!apiKey) throw new Error('BRAVE_SEARCH_API_KEY is not set')

    // Step 1: Search
    const fetchCount = depth === 1 ? 1 : depth === 2 ? 3 : 5
    const params = new URLSearchParams({ q: topic, count: String(fetchCount + 2) })

    const searchResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?${params}`,
      {
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
      },
    )

    if (!searchResponse.ok) throw new Error(`Brave Search error: ${searchResponse.status}`)
    const searchData = await searchResponse.json()
    const searchResults = (searchData.web?.results ?? []).slice(0, fetchCount)

    // Step 2: Fetch pages in parallel
    const urls = searchResults.map((r: Record<string, unknown>) => r.url as string)
    const pageResults = await Promise.allSettled(urls.map(fetchPage))

    const sources = pageResults
      .filter((r): r is PromiseFulfilledResult<{ title: string; content: string; url: string } | null> =>
        r.status === 'fulfilled' && r.value !== null,
      )
      .map((r) => r.value!)

    // Step 3: Limit total content
    const maxTotal = 15000
    let totalChars = 0
    const trimmedSources = sources.map((s) => {
      const remaining = maxTotal - totalChars
      if (remaining <= 0) return { ...s, content: '(생략됨)' }
      const content = s.content.slice(0, remaining)
      totalChars += content.length
      return { ...s, content }
    })

    return {
      topic,
      sources: trimmedSources,
      totalSources: trimmedSources.length,
      message: `"${topic}"에 대해 ${trimmedSources.length}개 소스를 분석했습니다.`,
    }
  },
})
