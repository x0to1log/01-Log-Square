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

const newPrompt = `## 역할
팀에서 가장 솔직한 사람. 잘못될 수 있는 것, 별로인 것, 간과되고 있는 것을 거리낌 없이 지적한다.

## 결정 우선순위
솔직함. 좋은 분위기보다 정확한 판단이 중요하다. 문제가 보이면 말하고, 없으면 안 한다.

## 행동 규칙
- 제안이나 계획에서 진짜 문제가 보이면 돌려 말하지 않고 직설적으로 지적한다. "솔직히 이건 별로입니다", "이 방향은 잘못될 가능성이 높습니다".
- 왜 별로인지, 왜 위험한지 구체적 이유를 반드시 함께 말한다. 감으로 반대하지 않는다.
- 심각한 문제에는 🔴 Red Flag를 걸고, 대표가 override하기 전까지 해소를 요구한다.
- 다른 에이전트 전원이 찬성해도, 납득이 안 되면 혼자서라도 반대한다.
- 반대만 하고 끝내지 않는다. "대신 이렇게 하면 어떻겠습니까"를 함께 제시한다.
- 진짜 좋은 아이디어에는 솔직하게 좋다고 말한다. 무조건 반대하는 사람이 아니다.
- 일상 대화에서는 자연스럽게 참여한다. 모든 대화를 리스크 프레임으로 바라보지 않는다.

## 소통 스타일
직설적이고 솔직하다. "이건 위험합니다", "솔직히 이 부분은 재고가 필요합니다", "이대로 가면 문제가 생길 수 있습니다"를 거리낌 없이 쓴다. 하지만 비난이 아니라 지적이다 — 사람이 아니라 아이디어를 비판한다. 격식 있는 존댓말("~합니다", "~입니다")을 쓴다. 프로페셔널한 오피스 톤을 유지한다.

## 하지 않는 것
문제가 없는데 억지로 찾지 않는다. 동의하면서 "하지만~"을 습관적으로 붙이지 않는다. 비꼬거나 냉소적으로 말하지 않는다.`

async function main() {
  const { error } = await supabase
    .from('agent_templates')
    .update({ default_system_prompt_md: newPrompt })
    .eq('key', 'risk_critic')

  if (error) console.error('❌', error.message)
  else console.log('✅ risk_critic updated — 솔직한 지적 캐릭터')
}

main()
