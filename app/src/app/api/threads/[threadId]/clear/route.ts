import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Thread } from '@/lib/types/database'

/**
 * POST /api/threads/[threadId]/clear
 * Archives the current thread and creates a new one of the same type.
 * Returns the new thread.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params
  const supabase = createServerClient()

  // Get original thread
  const { data: thread } = await supabase
    .from('threads')
    .select('*')
    .eq('id', Number(threadId))
    .single() as { data: Thread | null }

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  // Archive the old thread
  await supabase
    .from('threads')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', thread.id)

  // Create new thread with same properties
  const { data: newThread, error } = await supabase
    .from('threads')
    .insert({
      owner_user_id: thread.owner_user_id,
      scope_type: thread.scope_type,
      project_id: thread.project_id,
      thread_type: thread.thread_type,
      title: thread.title,
      direct_agent_instance_id: thread.direct_agent_instance_id,
      is_default: thread.is_default,
      metadata: thread.metadata,
    })
    .select()
    .single() as { data: Thread | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })

  return NextResponse.json(newThread)
}
