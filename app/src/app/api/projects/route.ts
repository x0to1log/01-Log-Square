import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/api-auth'
import type { Project } from '@/lib/types/database'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('last_opened_at', { ascending: false, nullsFirst: false }) as {
    data: Project[] | null
    error: unknown
  }

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(req: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const supabase = createServerClient()
  const body = await req.json()

  const { name, description } = body as { name: string; description?: string }
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 })

  const base = name
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, '')
    .replace(/\s+/g, '-')
    .replace(/^-|-$/g, '')
  const slug = base || `project-${Date.now()}`

  // For v1 single-user: use a fixed owner_user_id.
  // In production, this comes from auth.
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .limit(1) as { data: { id: string }[] | null }

  const ownerUserId = profiles?.[0]?.id
  if (!ownerUserId) {
    return NextResponse.json({ error: 'No user profile found' }, { status: 400 })
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      owner_user_id: ownerUserId,
      slug,
      name,
      description: description ?? null,
      status: 'active',
      phase: 'discovery',
    })
    .select()
    .single() as { data: Project | null; error: unknown }

  if (error) return NextResponse.json({ error }, { status: 500 })
  if (!project) return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })

  // Bootstrap: create agent instances, meeting room thread, DM threads.
  const { error: bootstrapError } = await supabase.rpc('bootstrap_project', {
    target_project_id: project.id,
  })

  if (bootstrapError) {
    console.error('bootstrap_project failed:', bootstrapError)
  }

  return NextResponse.json(project, { status: 201 })
}
