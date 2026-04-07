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

const MISSING_KEYS = ['documentation_manager', 'brand_designer', 'trend_scout']
const DISPLAY_ORDER = { documentation_manager: 6, brand_designer: 8, trend_scout: 10 }

async function fixProject(projectId) {
  const { data: project } = await supabase.from('projects').select('id, name, owner_user_id').eq('id', projectId).single()
  if (!project) { console.log(`  Project ${projectId} not found`); return }

  console.log(`\n📂 ${project.name} (id=${project.id})`)

  const { data: existing } = await supabase
    .from('agent_instances')
    .select('key')
    .eq('project_id', projectId)
    .in('key', MISSING_KEYS)

  const existingKeys = new Set((existing ?? []).map(e => e.key))
  const toCreate = MISSING_KEYS.filter(k => !existingKeys.has(k))

  if (toCreate.length === 0) {
    console.log('  ✅ All agents already exist')
    return
  }

  const { data: templates } = await supabase
    .from('agent_templates')
    .select('*')
    .in('key', toCreate)

  for (const t of templates ?? []) {
    const { data: instance, error: insError } = await supabase
      .from('agent_instances')
      .insert({
        owner_user_id: project.owner_user_id,
        agent_template_id: t.id,
        scope_type: 'project',
        project_id: projectId,
        key: t.key,
        name: t.name,
        role_title: t.role_title,
        presence_mode: t.default_presence_mode,
        is_core_member: t.default_is_core_member,
        can_raise_red_flag: t.default_can_raise_red_flag,
        can_block: t.default_can_block,
        can_verify: t.default_can_verify,
        config: t.default_config,
        display_order: DISPLAY_ORDER[t.key] ?? 10,
      })
      .select()
      .single()

    if (insError) {
      console.log(`  ❌ ${t.key}: ${insError.message}`)
      continue
    }

    const { error: thError } = await supabase
      .from('threads')
      .insert({
        owner_user_id: project.owner_user_id,
        scope_type: 'project',
        project_id: projectId,
        thread_type: 'direct_message',
        title: t.name,
        direct_agent_instance_id: instance.id,
        is_default: false,
      })

    if (thError) {
      console.log(`  ❌ ${t.key} thread: ${thError.message}`)
    } else {
      console.log(`  ✅ ${t.key} — added`)
    }
  }
}

async function main() {
  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .order('id')

  for (const p of projects ?? []) {
    await fixProject(p.id)
  }

  console.log('\nDone!')
}

main()
