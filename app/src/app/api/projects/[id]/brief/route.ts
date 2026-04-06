import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { Note } from '@/lib/types/database'

/**
 * Project Brief API — stores/retrieves a pinned "brief" note per project.
 * This is the primary way to teach agents about a project.
 */

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = createServerClient()

  const { data: brief } = await supabase
    .from('notes')
    .select('*')
    .eq('project_id', Number(id))
    .eq('note_type', 'brief')
    .eq('pinned', true)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single() as { data: Note | null }

  return NextResponse.json(brief)
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const projectId = Number(id)
  const supabase = createServerClient()
  const { body_md } = await req.json() as { body_md: string }

  if (!body_md?.trim()) {
    return NextResponse.json({ error: 'body_md is required' }, { status: 400 })
  }

  // Get project owner
  const { data: project } = await supabase
    .from('projects')
    .select('owner_user_id')
    .eq('id', projectId)
    .single() as { data: { owner_user_id: string } | null }

  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  // Check if brief already exists
  const { data: existing } = await supabase
    .from('notes')
    .select('id')
    .eq('project_id', projectId)
    .eq('note_type', 'brief')
    .eq('pinned', true)
    .limit(1)
    .single() as { data: { id: number } | null }

  if (existing) {
    // Update existing brief
    const { data, error } = await supabase
      .from('notes')
      .update({ body_md, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single() as { data: Note | null; error: unknown }

    if (error) return NextResponse.json({ error }, { status: 500 })
    return NextResponse.json(data)
  }

  // Create new brief
  const { data, error } = await supabase
    .from('notes')
    .insert({
      owner_user_id: project.owner_user_id,
      project_id: projectId,
      note_type: 'brief',
      title: '프로젝트 브리프',
      body_md,
      status: 'active',
      pinned: true,
      latest_revision_no: 1,
    })
    .select()
    .single() as { data: Note | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
