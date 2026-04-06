import { Agent } from '@mastra/core/agent'
import { createServerClient } from '@/lib/supabase/server'
import type { AgentInstance, AgentTemplate } from '@/lib/types/database'

const MODEL = 'openai/gpt-5-mini'

const BASE_INSTRUCTIONS = `You are an AI employee at 01 Log Square, a virtual office.
Your CEO (the representative) makes all final decisions.
Always respond in Korean unless explicitly asked otherwise.
Use formal, professional Korean (격식 있는 존댓말 — "~합니다", "~드리겠습니다"). Maintain a professional office tone.
When proposing structured outputs (decisions, actions, reviews), clearly mark them.

## 응답 길이 원칙
- 대표의 메시지 길이와 무게에 맞춰서 답하세요.
- 간단한 확인, 인사, 짧은 질문에는 1-2문장으로 답하세요. 불필요하게 늘리지 마세요.
- 분석이나 브리핑을 요청받았을 때만 구조화된 긴 답변을 하세요.
- "알겠습니다", "확인했습니다", "동의합니다" 로 충분한 상황에서는 그렇게 답하세요.

## 보고 포맷 가이드 (긴 답변에만 적용)
- 긴 보고서에는 **섹션 제목 앞에만** 이모지를 1개씩 사용해 시각적 구분을 줘 (예: 📋 운영 요약, 🔴 리스크, ✅ 완료 항목, 💡 제안, ⚠️ 주의)
- 본문 텍스트 안에는 이모지를 쓰지 마. 제목/라벨에만 사용
- 짧은 답변(2-3줄)에는 이모지 불필요
- 불릿 포인트(-)와 들여쓰기로 계층 구조를 만들어 읽기 쉽게
- 핵심 키워드는 **볼드** 처리`

/**
 * Creates a Mastra Agent from an agent instance + template.
 * Persona is loaded from Supabase at runtime — not hardcoded.
 * If projectContext is provided, the agent can reference project history.
 */
export function createAgentFromInstance(
  instance: AgentInstance,
  template: AgentTemplate | null,
  projectContext?: string,
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

## 프로젝트 현황 (자동 로드됨)
아래는 이 프로젝트의 현재 상태입니다. 이 정보를 바탕으로 맥락 있는 답변을 해주세요.

${projectContext}`
  }

  return new Agent({
    id: `agent-${instance.key}-${instance.id}`,
    name: instance.name,
    description: `${instance.role_title} — ${instance.key}`,
    instructions,
    model: MODEL,
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
    agent: createAgentFromInstance(instance, template, projectContext),
    instance,
  }
}

/**
 * Loads all core agents for a project (for Meeting Room supervisor).
 * Optionally injects project context into each agent's instructions.
 */
export async function getCoreAgents(projectId: number, projectContext?: string) {
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
    ),
    instance,
  }))
}
