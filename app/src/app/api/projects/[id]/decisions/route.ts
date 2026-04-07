import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import type { Decision } from '@/lib/types/database'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('decisions')
    .select('*')
    .eq('project_id', Number(id))
    .order('created_at', { ascending: false }) as { data: Decision[] | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data ?? [])
}
