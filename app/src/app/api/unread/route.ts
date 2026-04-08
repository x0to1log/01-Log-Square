import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'

/**
 * GET /api/unread
 * Returns unread message counts per thread and per project.
 */
export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const supabase = createServerClient()

  // Get all non-archived threads with their last_message_at
  const { data: threads } = await supabase
    .from('threads')
    .select('id, project_id, thread_type, title, last_message_at, direct_agent_instance_id')
    .is('archived_at', null) as {
    data: {
      id: number
      project_id: number | null
      thread_type: string
      title: string
      last_message_at: string | null
      direct_agent_instance_id: number | null
    }[] | null
  }

  if (!threads?.length) return NextResponse.json({ threads: [], projects: {} })

  // Get user's read status for all threads
  const { data: readStatuses } = await supabase
    .from('thread_read_status')
    .select('thread_id, last_read_at')
    .eq('user_id', auth.user.id) as {
    data: { thread_id: number; last_read_at: string }[] | null
  }

  const readMap = new Map(
    (readStatuses ?? []).map((r) => [r.thread_id, r.last_read_at]),
  )

  // Count unread messages per thread
  const threadUnreads: {
    thread_id: number
    project_id: number | null
    title: string
    unread_count: number
  }[] = []

  const projectUnreads: Record<number, number> = {}

  for (const thread of threads) {
    const lastRead = readMap.get(thread.id)

    // If never read, count all messages. If read, count messages after last_read_at.
    let query = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('thread_id', thread.id)
      .neq('sender_type', 'representative') // Don't count own messages

    if (lastRead) {
      query = query.gt('created_at', lastRead)
    }

    const { count } = await query

    const unreadCount = count ?? 0
    if (unreadCount > 0) {
      threadUnreads.push({
        thread_id: thread.id,
        project_id: thread.project_id,
        title: thread.title,
        unread_count: unreadCount,
      })

      if (thread.project_id) {
        projectUnreads[thread.project_id] = (projectUnreads[thread.project_id] ?? 0) + unreadCount
      }
    }
  }

  return NextResponse.json({
    threads: threadUnreads,
    projects: projectUnreads,
  })
}
