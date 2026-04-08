import { createServerClient } from '@/lib/supabase/server'

/**
 * Loads the owner_user_id for a given project.
 * All write tools need this to satisfy Supabase RLS ownership.
 */
export async function getProjectOwner(projectId: number): Promise<string> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('projects')
    .select('owner_user_id')
    .eq('id', projectId)
    .single()
  if (error || !data) throw new Error(`Project ${projectId} not found`)
  return data.owner_user_id as string
}
