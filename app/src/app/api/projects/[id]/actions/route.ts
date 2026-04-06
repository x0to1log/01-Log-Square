import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { ActionItem } from '@/lib/types/database'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .eq('project_id', Number(id))
    .in('status', ['open', 'in_progress', 'blocked'])
    .order('priority')
    .order('created_at', { ascending: false }) as { data: ActionItem[] | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data ?? [])
}
