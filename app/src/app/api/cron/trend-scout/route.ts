import { NextResponse } from 'next/server'
import { Agent } from '@mastra/core/agent'
import { createServerClient } from '@/lib/supabase/server'
import { loadProjectContext, formatProjectContext } from '@/mastra/context'
import type { Project, Thread, Note } from '@/lib/types/database'
import { z } from 'zod'

export const maxDuration = 120

const MODEL = 'openai/gpt-5-mini'
const SEARCH_MODEL = 'openai/gpt-5-mini'

/**
 * Cron endpoint: Trend Scout daily briefing.
 * Runs once per day for each active project.
 *
 * Security: protected by CRON_SECRET header.
 */
export async function GET(req: Request) {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServerClient()

  // Get all active projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('status', 'active') as { data: Project[] | null }

  if (!projects?.length) {
    return NextResponse.json({ message: 'No active projects' })
  }

  const results: { project: string; status: string; newsCount?: number }[] = []

  for (const project of projects) {
    try {
      const result = await generateBriefing(supabase, project)
      results.push(result)
    } catch (err) {
      console.error(`[Trend Scout] ${project.name} failed:`, err)
      results.push({ project: project.name, status: 'error' })
    }
  }

  return NextResponse.json({ results })
}

async function generateBriefing(
  supabase: ReturnType<typeof createServerClient>,
  project: Project,
) {
  // 1. Load project brief
  const { data: brief } = await supabase
    .from('notes')
    .select('body_md')
    .eq('project_id', project.id)
    .eq('note_type', 'brief')
    .eq('pinned', true)
    .limit(1)
    .single() as { data: { body_md: string } | null }

  const briefContent = brief?.body_md ?? project.description ?? project.name

  // 2. Extract search keywords from brief
  const keywordAgent = new Agent({
    id: 'keyword-extractor',
    name: 'KeywordExtractor',
    model: MODEL,
    instructions: 'Extract 3-5 English search keywords from the project description. Focus on technologies, competitors, and market terms. Return only a JSON array of strings.',
  })

  const keywordResult = await keywordAgent.generate(
    `Project: ${project.name}\n\n${briefContent}\n\nReturn a JSON array of 3-5 English search keywords for finding relevant recent news.`,
    {
      structuredOutput: {
        schema: z.object({
          keywords: z.array(z.string()).describe('3-5 search keywords'),
        }),
      },
    },
  )

  const keywords = keywordResult.object?.keywords ?? [project.name]
  console.log(`[Trend Scout] ${project.name} keywords:`, keywords)

  // 3. Search for recent news using Brave Search
  const braveApiKey = process.env.BRAVE_SEARCH_API_KEY
  if (!braveApiKey) {
    return { project: project.name, status: 'skipped — no BRAVE_SEARCH_API_KEY' }
  }

  const allResults: { title: string; url: string; description: string }[] = []

  for (const keyword of keywords.slice(0, 3)) {
    try {
      const params = new URLSearchParams({
        q: keyword,
        count: '5',
        freshness: 'pd', // past day
      })

      const response = await fetch(
        `https://api.search.brave.com/res/v1/web/search?${params}`,
        {
          headers: {
            Accept: 'application/json',
            'X-Subscription-Token': braveApiKey,
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        const webResults = (data.web?.results ?? []).slice(0, 3)
        for (const r of webResults) {
          // Dedup by URL
          if (!allResults.some((existing) => existing.url === r.url)) {
            allResults.push({
              title: r.title ?? '',
              url: r.url ?? '',
              description: r.description ?? '',
            })
          }
        }
      }
    } catch {
      // Skip failed searches
    }
  }

  if (allResults.length === 0) {
    return { project: project.name, status: 'no news found' }
  }

  // 4. LLM filters and writes briefing
  const newsContext = allResults
    .map((r, i) => `${i + 1}. [${r.title}](${r.url})\n   ${r.description}`)
    .join('\n\n')

  const writerAgent = new Agent({
    id: 'trend-scout-writer',
    name: 'TrendScoutWriter',
    model: MODEL,
    instructions: `You are Trend Scout for 01 Log Square.
Write a daily news briefing in Korean. Be concise and practical.

Rules:
- Only include news that is ACTUALLY relevant to this project. Skip irrelevant results.
- For each relevant news item: title, 1-2 sentence summary, and how it affects this project.
- If no news is relevant, respond with exactly: NO_RELEVANT_NEWS
- Use 격식 있는 존댓말.
- Max 2-3 news items.`,
  })

  const briefingResult = await writerAgent.generate(
    `## 프로젝트: ${project.name}
${briefContent}

## 오늘 검색된 뉴스 (${allResults.length}건)
${newsContext}

위 뉴스 중 이 프로젝트와 관련 있는 것만 골라서 브리핑해주세요.`,
  )

  const briefingText = briefingResult.text.trim()

  if (briefingText === 'NO_RELEVANT_NEWS' || briefingText.length < 20) {
    return { project: project.name, status: 'no relevant news' }
  }

  // 5. Find Trend Scout DM thread and save message
  const { data: trendScout } = await supabase
    .from('agent_instances')
    .select('id')
    .eq('project_id', project.id)
    .eq('key', 'trend_scout')
    .single() as { data: { id: number } | null }

  if (!trendScout) {
    return { project: project.name, status: 'no trend_scout agent' }
  }

  const { data: dmThread } = await supabase
    .from('threads')
    .select('id, owner_user_id')
    .eq('project_id', project.id)
    .eq('thread_type', 'direct_message')
    .eq('direct_agent_instance_id', trendScout.id)
    .is('archived_at', null)
    .single() as { data: { id: number; owner_user_id: string } | null }

  if (!dmThread) {
    return { project: project.name, status: 'no DM thread' }
  }

  // Save briefing as message
  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  })

  await supabase.from('messages').insert({
    owner_user_id: dmThread.owner_user_id,
    thread_id: dmThread.id,
    sender_type: 'agent',
    sender_agent_instance_id: trendScout.id,
    message_kind: 'chat',
    body_md: `📰 **${today} 관련 뉴스 브리핑**\n\n${briefingText}`,
  })

  // Update thread timestamp
  await supabase
    .from('threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', dmThread.id)

  return {
    project: project.name,
    status: 'briefing sent',
    newsCount: allResults.length,
  }
}
