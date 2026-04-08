import { Agent } from '@mastra/core/agent'
import { createServerClient } from '@/lib/supabase/server'
import type { AgentInstance, AgentTemplate } from '@/lib/types/database'
import { getToolsForAgent } from '../tools'

const MODEL_DEFAULT = 'openai/gpt-5-mini'
const MODEL_DEEP = 'openai/gpt-5'

const DEEP_TRIGGERS = [
  '자세히', '분석', '브리핑', '정리해', '비교해', '검토해', '리뷰해',
  '전략', '계획', '설계', '깊게', '상세', '종합', '평가',
  'detail', 'analyze', 'review', 'compare', 'brief',
]

export function selectModel(message: string): string {
  const lower = message.toLowerCase()
  return DEEP_TRIGGERS.some((t) => lower.includes(t)) ? MODEL_DEEP : MODEL_DEFAULT
}

const BASE_INSTRUCTIONS = `You are an AI employee at 01 Log Square, a virtual office.
Your CEO (the representative) makes all final decisions.
Always respond in Korean unless explicitly asked otherwise.
Use formal, professional Korean (격식 있는 존댓말 — "~합니다", "~드리겠습니다"). Maintain a professional office tone.
When proposing structured outputs (decisions, actions, reviews), clearly mark them.

## 가장 중요한 규칙
대표가 물어본 것에만 답하세요. 물어보지 않은 것을 스스로 꺼내지 마세요.
프로젝트 배경 정보가 있더라도, 대표가 그것에 대해 물어야만 활용하세요.
숫자, 기한, 계획을 대표가 요청하지 않았으면 제시하지 마세요.

## 대화 스타일
당신은 채팅으로 대화하는 팀원입니다. 보고서를 작성하는 게 아닙니다.

### 기본: 짧게
- 기본 답변은 1-3문장입니다. 사람이 채팅할 때처럼요.
- 한 번에 모든 걸 쏟아내지 마세요. 핵심만 말하고 대표의 반응을 기다리세요.
- "알겠습니다", "확인했습니다", "동의합니다"로 충분하면 그렇게 답하세요.

### 길게 답하는 경우
대표가 명시적으로 요청할 때만 길게 답하세요:
- "자세히 말해줘", "브리핑해줘", "분석해줘", "정리해줘", "비교해줘"
- 이런 요청이 있을 때만 구조화된 긴 답변을 하세요.

### 되묻기
모호하면 바로 답하지 말고 되물으세요:
- "어떤 측면에서 말씀하시는 건가요?"
- "A 방향이요, B 방향이요?"
- "기한이 있으신 건가요?"

### 금지 표현
절대 쓰지 마세요. 이 표현들은 AI처럼 들립니다:
- "Here's a comprehensive overview", "Let me provide you with"
- "종합적으로 말씀드리면", "다음과 같이 정리해 드리겠습니다"
- "Furthermore", "Additionally", "Moreover"
- 불필요한 서론 ("좋은 질문입니다", "말씀하신 부분에 대해서")
- 매번 "~드리겠습니다"로 끝내기 (가끔은 "~입니다", "~같습니다"로)

### 좋은 대화 예시
❌ "현재 프로젝트의 기술 스택은 Next.js, TypeScript, Tailwind CSS로 구성되어 있으며, 에이전트 런타임으로는 Mastra를 사용하고 있습니다. 데이터베이스는 Supabase를 활용하고 있습니다."
✅ "기술 스택은 Next.js + Mastra + Supabase입니다. 특정 부분이 궁금하신 건가요?"

❌ "말씀하신 부분에 대해 종합적으로 분석해 드리겠습니다. 첫째로..."
✅ "그 부분은 좀 리스크가 있습니다. 자세히 풀어드릴까요?"

❌ "알겠습니다. 그러면 다음과 같이 진행하겠습니다. 1) 먼저... 2) 그 다음..."
✅ "알겠습니다. 바로 진행하겠습니다."

## 보고 포맷 가이드 (긴 답변에만 적용)
- 긴 보고서에는 **섹션 제목 앞에만** 이모지를 1개씩 사용해 시각적 구분을 줘 (예: 📋 운영 요약, 🔴 리스크, ✅ 완료 항목, 💡 제안, ⚠️ 주의)
- 본문 텍스트 안에는 이모지를 쓰지 마. 제목/라벨에만 사용
- 짧은 답변(2-3줄)에는 이모지 불필요
- 불릿 포인트(-)와 들여쓰기로 계층 구조를 만들어 읽기 쉽게
- 핵심 키워드는 **볼드** 처리

## 도구 사용
당신에게는 정보를 조회, 검색, 생성할 수 있는 도구가 있습니다.

### 검색 도구
- 대표가 "검색해줘", "찾아봐줘", "인터넷에서", "최신 정보", "트렌드" 같은 말을 하면 반드시 web-search 도구를 사용하세요.
- 대표가 URL을 주면서 "읽어봐", "확인해줘", "이 페이지 봐줘" 같은 말을 하면 web-fetch 도구를 사용하세요.
- 프로젝트 비전, 조직 구조, 설계 방향 등 운영 문서를 확인해야 할 때 search-vault 도구를 사용하세요.

### 생성 도구
- 논의가 정리되어 결정이 필요하면 create-decision 도구로 결정 초안을 생성하세요.
- 구체적인 할 일이 나오면 create-action-item 도구로 액션 아이템을 생성하세요.
- 회의 내용이나 참고자료를 기록해야 하면 create-note 도구로 노트를 생성하세요.
- 생성한 항목은 모두 초안 상태입니다. 대표가 별도로 승인합니다. 대표에게 "초안으로 생성했습니다"라고 알려주세요.

### 공통 규칙
- 도구 결과를 그대로 복사하지 말고, 핵심만 요약해서 자연스럽게 대화에 포함시키세요.
- 도구가 필요 없는 일반 대화에서는 사용하지 마세요.`

/**
 * Creates a Mastra Agent from an agent instance + template.
 * Persona is loaded from Supabase at runtime — not hardcoded.
 * If projectContext is provided, the agent can reference project history.
 */
export function createAgentFromInstance(
  instance: AgentInstance,
  template: AgentTemplate | null,
  projectContext?: string,
  model?: string,
): Agent {
  const systemPrompt = instance.persona_override_md
    ?? template?.default_system_prompt_md
    ?? ''

  let instructions = `${BASE_INSTRUCTIONS}

## Your Role
- Name: ${instance.name}
- Title: ${instance.role_title}
- Key: ${instance.key}

${systemPrompt}`

  if (projectContext) {
    instructions += `

## 프로젝트 배경 정보 (참고용)
아래는 이 프로젝트의 배경 정보입니다. 대표가 질문할 때 참고만 하세요.
이 정보를 스스로 요약하거나 계획을 세우지 마세요. 대표가 물어본 것에만 답하세요.

${projectContext}`
  }

  return new Agent({
    id: `agent-${instance.key}-${instance.id}`,
    name: instance.name,
    description: `${instance.role_title} — ${instance.key}`,
    instructions,
    model: model ?? MODEL_DEFAULT,
    tools: getToolsForAgent(instance.key),
    defaultOptions: {
      maxSteps: 5,
    },
  })
}

/**
 * Loads an agent by key for a specific project.
 * Optionally injects project context into the agent's instructions.
 */
export async function getProjectAgent(
  projectId: number,
  agentKey: string,
  projectContext?: string,
  model?: string,
) {
  const supabase = createServerClient()

  const { data: instance } = await supabase
    .from('agent_instances')
    .select('*')
    .eq('project_id', projectId)
    .eq('key', agentKey)
    .single() as { data: AgentInstance | null }

  if (!instance) throw new Error(`Agent "${agentKey}" not found for project ${projectId}`)

  let template: AgentTemplate | null = null
  if (instance.agent_template_id) {
    const { data } = await supabase
      .from('agent_templates')
      .select('*')
      .eq('id', instance.agent_template_id)
      .single() as { data: AgentTemplate | null }
    template = data
  }

  return {
    agent: createAgentFromInstance(instance, template, projectContext, model),
    instance,
  }
}

/**
 * Loads all core agents for a project (for Meeting Room supervisor).
 * Optionally injects project context into each agent's instructions.
 */
export async function getCoreAgents(projectId: number, projectContext?: string, model?: string) {
  const supabase = createServerClient()

  const { data: instances } = await supabase
    .from('agent_instances')
    .select('*')
    .eq('project_id', projectId)
    .eq('is_core_member', true)
    .order('display_order') as { data: AgentInstance[] | null }

  if (!instances?.length) throw new Error(`No core agents found for project ${projectId}`)

  const templateIds = instances
    .map((i) => i.agent_template_id)
    .filter((id): id is number => id !== null)

  const { data: templates } = await supabase
    .from('agent_templates')
    .select('*')
    .in('id', templateIds) as { data: AgentTemplate[] | null }

  const templateMap = new Map((templates ?? []).map((t) => [t.id, t]))

  return instances.map((instance) => ({
    agent: createAgentFromInstance(
      instance,
      templateMap.get(instance.agent_template_id!) ?? null,
      projectContext,
      model,
    ),
    instance,
  }))
}
