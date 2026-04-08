import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'

const VAULT_ROOT = path.join(process.cwd(), '..', 'square')

function findMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []

  const results: string[] = []
  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.name === '.obsidian' || entry.name === 'node_modules') continue

    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(fullPath))
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath)
    }
  }
  return results
}

function extractSnippet(content: string, query: string, maxLen: number = 2000): string {
  const lowerContent = content.toLowerCase()
  const lowerQuery = query.toLowerCase()
  const idx = lowerContent.indexOf(lowerQuery)

  if (idx === -1) return content.slice(0, maxLen)

  const start = Math.max(0, idx - 500)
  const end = Math.min(content.length, idx + query.length + 1500)
  const snippet = content.slice(start, end)

  return (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : '')
}

export const searchVault = createTool({
  id: 'search-vault',
  description:
    'square vault에서 설계 문서, 운영 지침, 프로젝트 규칙을 검색합니다. 비전, 조직 구조, 디자인 방향 등을 확인할 때 사용하세요.',
  inputSchema: z.object({
    query: z.string().describe('검색 키워드 (파일명 및 내용에서 검색)'),
    folder: z
      .string()
      .optional()
      .describe('검색 범위를 제한할 폴더명 (예: 01-Core, 08-Design, 02-Organization)'),
  }),
  execute: async ({ query, folder }) => {
    const searchRoot = folder ? path.join(VAULT_ROOT, folder) : VAULT_ROOT

    if (!fs.existsSync(searchRoot)) {
      return {
        results: [],
        count: 0,
        message: 'Vault가 이 환경에서 접근 불가능합니다.',
      }
    }

    const files = findMarkdownFiles(searchRoot)
    const lowerQuery = query.toLowerCase()

    const scored: { file: string; score: number; content: string }[] = []

    for (const file of files) {
      const relativePath = path.relative(VAULT_ROOT, file).replace(/\\/g, '/')
      const fileName = path.basename(file, '.md').toLowerCase()
      const content = fs.readFileSync(file, 'utf-8')
      const lowerContent = content.toLowerCase()

      let score = 0
      if (fileName.includes(lowerQuery)) score += 3
      if (lowerContent.includes(lowerQuery)) score += 1

      // Bonus for title/tag match in frontmatter
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (frontmatterMatch) {
        const fm = frontmatterMatch[1].toLowerCase()
        if (fm.includes(lowerQuery)) score += 2
      }

      if (score > 0) {
        scored.push({ file: relativePath, score, content })
      }
    }

    scored.sort((a, b) => b.score - a.score)
    const top = scored.slice(0, 5)

    return {
      results: top.map((item) => ({
        path: item.file,
        title: path.basename(item.file, '.md').replace(/-/g, ' '),
        snippet: extractSnippet(item.content, query),
      })),
      count: top.length,
    }
  },
})
