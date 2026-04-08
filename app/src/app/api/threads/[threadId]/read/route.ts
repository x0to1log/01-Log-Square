import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'

/**
 * POST /api/threads/[threadId]/read
 * Marks the thread as read up to now.
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { threadId } = await params
  const supabase = createServerClient()

  // Upsert: update if exists, insert if not
  const { error } = await supabase
    .from('thread_read_status')
    .upsert(
      {
        user_id: auth.user.id,
        thread_id: Number(threadId),
        last_read_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,thread_id' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
