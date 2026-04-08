import { createTool } from '@mastra/core/tools'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { getProjectOwner } from './helpers'

export const createActionItem = createTool({
  id: 'create-action-item',
  description:
    '프로젝트에 액션 아이템을 생성합니다. 구체적인 할 일이 나왔을 때 사용하세요.',
  inputSchema: z.object({
    project_id: z.number().describe('프로젝트 ID'),
    title: z.string().describe('액션 아이템 제목'),
    description_md: z.string().describe('상세 설명 (마크다운)'),
    priority: z
      .enum(['low', 'medium', 'high', 'critical'])
      .default('medium')
      .describe('우선순위'),
    assignee_key: z
      .string()
      .optional()
      .describe('담당 에이전트 key (예: coo, cto). 미지정 시 unassigned'),
  }),
  execute: async ({ project_id, title, description_md, priority: rawPriority, assignee_key }) => {
    const priority = rawPriority ?? 'medium'
    const ownerUserId = await getProjectOwner(project_id)
    const supabase = createServerClient()

    let assigneeType: 'agent' | 'unassigned' = 'unassigned'
    let assigneeAgentInstanceId: number | null = null

    if (assignee_key) {
      const { data: agent } = await supabase
        .from('agent_instances')
        .select('id')
        .eq('project_id', project_id)
        .eq('key', assignee_key)
        .single()

      if (agent) {
        assigneeType = 'agent'
        assigneeAgentInstanceId = agent.id
      }
    }

    const { data, error } = await supabase
      .from('action_items')
      .insert({
        owner_user_id: ownerUserId,
        project_id,
        title,
        description_md,
        status: 'open',
        priority,
        assignee_type: assigneeType,
        assignee_agent_instance_id: assigneeAgentInstanceId,
      })
      .select('id, title, status, priority')
      .single()

    if (error) throw new Error(`액션 아이템 생성 실패: ${error.message}`)

    return {
      actionItem: data,
      message: `액션 아이템 "${title}"이(가) 생성되었습니다. (우선순위: ${priority})`,
    }
  },
})
