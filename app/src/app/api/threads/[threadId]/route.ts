import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

/**
 * DELETE /api/threads/[threadId]
 * Permanently deletes an archived thread and its messages.
 */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params
  const supabase = createServerClient()

  // Only allow deleting archived threads
  const { data: thread } = await supabase
    .from('threads')
    .select('id, archived_at')
    .eq('id', Number(threadId))
    .single() as { data: { id: number; archived_at: string | null } | null }

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  if (!thread.archived_at) {
    return NextResponse.json({ error: 'Can only delete archived threads' }, { status: 400 })
  }

  // Delete messages first, then thread
  await supabase.from('messages').delete().eq('thread_id', thread.id)
  await supabase.from('threads').delete().eq('id', thread.id)

  return NextResponse.json({ deleted: true })
}
