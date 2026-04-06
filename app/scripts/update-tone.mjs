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

// Old → New tone replacements
const replacements = [
  // COO
  ['편한 존댓말("~해요", "~같아요")을 쓴다.', '격식 있는 존댓말("~합니다", "~드리겠습니다")을 쓴다. 프로페셔널한 오피스 톤을 유지한다.'],
  // Generic pattern used in most agents
  ['편한 존댓말을 쓴다.', '격식 있는 존댓말("~합니다", "~입니다")을 쓴다. 프로페셔널한 오피스 톤을 유지한다.'],
]

async function main() {
  const { data: templates } = await supabase
    .from('agent_templates')
    .select('id, key, default_system_prompt_md')

  let updated = 0
  for (const t of templates ?? []) {
    if (!t.default_system_prompt_md) continue

    let prompt = t.default_system_prompt_md
    let changed = false

    for (const [old, nw] of replacements) {
      if (prompt.includes(old)) {
        prompt = prompt.replace(old, nw)
        changed = true
      }
    }

    if (changed) {
      const { error } = await supabase
        .from('agent_templates')
        .update({ default_system_prompt_md: prompt })
        .eq('id', t.id)

      if (error) console.error(`❌ ${t.key}:`, error.message)
      else { console.log(`✅ ${t.key}`); updated++ }
    } else {
      console.log(`⏭️ ${t.key} (no match found)`)
    }
  }

  console.log(`\nDone: ${updated} updated`)
}

main()
