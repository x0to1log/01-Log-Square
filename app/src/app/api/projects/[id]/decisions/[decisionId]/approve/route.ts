import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Decision } from '@/lib/types/database'

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string; decisionId: string }> },
) {
  const { decisionId } = await params
  const supabase = createServerClient()

  // Get first user profile for v1 single-user
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1) as { data: { id: string }[] | null }

  const userId = profiles?.[0]?.id
  if (!userId) return NextResponse.json({ error: 'No user found' }, { status: 400 })

  const { data, error } = await supabase
    .from('decisions')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by_user_id: userId,
    })
    .eq('id', Number(decisionId))
    .select()
    .single() as { data: Decision | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'Decision not found' }, { status: 404 })

  // Log the event
  await supabase.from('decision_events').insert({
    owner_user_id: userId,
    decision_id: Number(decisionId),
    event_type: 'approved',
    actor_type: 'representative',
    from_status: 'pending_review',
    to_status: 'approved',
  })

  return NextResponse.json(data)
}
