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
  // Test if table already exists
  const { error: testErr } = await supabase.from('ai_usage_logs').select('id').limit(1)

  if (!testErr) {
    console.log('✅ ai_usage_logs table already exists')
    return
  }

  // Table doesn't exist — need to create via Supabase SQL Editor
  console.log('⚠️  ai_usage_logs table does not exist yet.')
  console.log('')
  console.log('Please run this SQL in Supabase Dashboard → SQL Editor:')
  console.log('─'.repeat(60))
  console.log(readFileSync(resolve(__dirname, '..', '..', 'supabase', 'migrations', '00009_ai_usage_logs.sql'), 'utf-8'))
  console.log('─'.repeat(60))
}

main()
