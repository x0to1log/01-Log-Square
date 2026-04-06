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

const projectId = Number(process.argv[2])
const brief = process.argv[3]

if (!projectId || !brief) {
  console.error('Usage: node save-brief.mjs <projectId> <brief>')
  process.exit(1)
}

async function main() {
  const { data: project } = await supabase
    .from('projects')
    .select('owner_user_id')
    .eq('id', projectId)
    .single()

  if (!project) { console.error('Project not found'); return }

  const { data, error } = await supabase
    .from('notes')
    .insert({
      owner_user_id: project.owner_user_id,
      project_id: projectId,
      note_type: 'brief',
      title: '프로젝트 브리프',
      body_md: brief,
      status: 'active',
      pinned: true,
      latest_revision_no: 1,
    })
    .select()
    .single()

  if (error) console.error('Error:', error.message)
  else console.log(`✅ Brief saved for project ${projectId} (note id: ${data.id})`)
}

main()
