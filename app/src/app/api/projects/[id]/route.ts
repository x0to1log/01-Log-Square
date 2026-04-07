import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import type { Project, Thread, AgentInstance } from '@/lib/types/database'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const supabase = createServerClient()

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', Number(id))
    .single() as { data: Project | null }

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Also fetch threads and agent instances for the workspace shell
  const threadsResult = await supabase
    .from('threads')
    .select('*')
    .eq('project_id', project.id)
    .is('archived_at', null)
    .order('thread_type')
    .order('title') as { data: Thread[] | null }

  const agentsResult = await supabase
    .from('agent_instances')
    .select('*')
    .eq('project_id', project.id)
    .order('display_order') as { data: AgentInstance[] | null }

  const threads = threadsResult.data
  const agents = agentsResult.data

  // Update last_opened_at
  await supabase
    .from('projects')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', project.id)

  return NextResponse.json({
    project,
    threads: threads ?? [],
    agents: agents ?? [],
  })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params
  const supabase = createServerClient()
  const body = await req.json()

  const allowed = ['status', 'phase', 'name', 'description'] as const
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', Number(id))
    .select()
    .single() as { data: Project | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data)
}
