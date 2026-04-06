import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Message } from '@/lib/types/database'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params
  const supabase = createServerClient()

  const searchParams = req.nextUrl.searchParams
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)
  const before = searchParams.get('before') // message id for backward pagination
  const after = searchParams.get('after') // message id for polling new messages

  let query = supabase
    .from('messages')
    .select('*')
    .eq('thread_id', Number(threadId))
    .order('created_at', { ascending: true })
    .limit(limit)

  if (before) {
    query = query.lt('id', Number(before))
  }
  if (after) {
    query = query.gt('id', Number(after))
  }

  const { data, error } = await query as { data: Message[] | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const { threadId } = await params
  const supabase = createServerClient()
  const body = await req.json()

  const { body_md } = body as { body_md: string }
  if (!body_md?.trim()) {
    return NextResponse.json({ error: 'body_md is required' }, { status: 400 })
  }

  // Get thread owner for v1 single-user
  const { data: thread } = await supabase
    .from('threads')
    .select('owner_user_id')
    .eq('id', Number(threadId))
    .single() as { data: { owner_user_id: string } | null }

  if (!thread) return NextResponse.json({ error: 'Thread not found' }, { status: 404 })

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      owner_user_id: thread.owner_user_id,
      thread_id: Number(threadId),
      sender_type: 'representative',
      message_kind: 'chat',
      body_md,
    })
    .select()
    .single() as { data: Message | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })

  // Update thread's last_message_at
  await supabase
    .from('threads')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', Number(threadId))

  return NextResponse.json(message, { status: 201 })
}
