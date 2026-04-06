import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  // 1. Get project 2's owner
  const { data: project } = await supabase.from('projects').select('id, owner_user_id').eq('id', 2).single()
  if (!project) { console.error('Project 2 not found'); return }

  // 2. Get workspace-scope templates that are missing from project 2
  const missingKeys = ['documentation_manager', 'brand_designer', 'trend_scout']

  // Check which already exist
  const { data: existing } = await supabase
    .from('agent_instances')
    .select('key')
    .eq('project_id', 2)
    .in('key', missingKeys)

  const existingKeys = new Set((existing ?? []).map(e => e.key))
  const toCreate = missingKeys.filter(k => !existingKeys.has(k))

  if (toCreate.length === 0) {
    console.log('All agents already exist in project 2')
    return
  }

  // 3. Get templates for missing agents
  const { data: templates } = await supabase
    .from('agent_templates')
    .select('*')
    .in('key', toCreate)

  // 4. Create instances + DM threads
  for (const t of templates ?? []) {
    const { data: instance, error: insError } = await supabase
      .from('agent_instances')
      .insert({
        owner_user_id: project.owner_user_id,
        agent_template_id: t.id,
        scope_type: 'project',
        project_id: 2,
        key: t.key,
        name: t.name,
        role_title: t.role_title,
        presence_mode: t.default_presence_mode,
        is_core_member: t.default_is_core_member,
        can_raise_red_flag: t.default_can_raise_red_flag,
        can_block: t.default_can_block,
        can_verify: t.default_can_verify,
        config: t.default_config,
        display_order: t.key === 'documentation_manager' ? 6 : t.key === 'brand_designer' ? 8 : 10,
      })
      .select()
      .single()

    if (insError) {
      console.error(`❌ instance ${t.key}:`, insError.message)
      continue
    }

    // Create DM thread
    const { error: thError } = await supabase
      .from('threads')
      .insert({
        owner_user_id: project.owner_user_id,
        scope_type: 'project',
        project_id: 2,
        thread_type: 'direct_message',
        title: t.name,
        direct_agent_instance_id: instance.id,
        is_default: false,
      })

    if (thError) {
      console.error(`❌ thread ${t.key}:`, thError.message)
    } else {
      console.log(`✅ ${t.key} — instance + DM thread created`)
    }
  }
}

main()
