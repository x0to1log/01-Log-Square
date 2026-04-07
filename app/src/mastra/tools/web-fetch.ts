import { createTool } from '@mastra/core/tools'
import { z } from 'zod'

export const webFetch = createTool({
  id: 'web-fetch',
  description:
    'URL을 직접 열어서 페이지 내용을 가져옵니다. 특정 웹 페이지의 원문을 읽어야 할 때 사용하세요.',
  inputSchema: z.object({
    url: z.string().url().describe('가져올 웹 페이지 URL'),
  }),
  outputSchema: z.object({
    title: z.string(),
    content: z.string(),
    url: z.string(),
  }),
  execute: async ({ url }) => {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; 01LogSquare/1.0)',
        Accept: 'text/html,application/xhtml+xml,text/plain',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`)

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const title = titleMatch?.[1]?.trim() ?? ''

    // Strip HTML tags and get text content
    const content = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 5000) // Limit to ~5000 chars to avoid token overflow

    return { title, content, url }
  },
})
