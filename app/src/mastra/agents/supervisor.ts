import { Agent } from '@mastra/core/agent'
import { getCoreAgents } from './index'
import { loadProjectContext, formatProjectContext } from '../context'

const MODEL = 'openai/gpt-5'

/**
 * Creates a Meeting Room supervisor agent for a project.
 * The supervisor coordinates the 5 core agents (COO, CSO, CTO, Risk Critic, Verifier).
 * All agents receive the project's operational context (decisions, actions, notes, reviews).
 */
export async function createMeetingRoomSupervisor(projectId: number) {
  const ctx = await loadProjectContext(projectId)
  const projectContext = formatProjectContext(ctx)
  const coreAgents = await getCoreAgents(projectId, projectContext)

  const agentsMap: Record<string, Agent> = {}
  const agentDescriptions: string[] = []

  for (const { agent, instance } of coreAgents) {
    agentsMap[instance.key] = agent
    agentDescriptions.push(`- ${instance.key} (${instance.name}): ${instance.role_title}`)
  }

  const supervisor = new Agent({
    id: `meeting-room-supervisor-${projectId}`,
    name: 'Meeting Room Supervisor',
    description: 'Coordinates Meeting Room discussions by routing messages to the right core agents.',
    instructions: `You are the Meeting Room facilitator for 01 Log Square.
You run meetings where core agents actively discuss the CEO's topic.

## Available Agents
${agentDescriptions.join('\n')}

## Core Principle: Active Discussion
This is a MEETING, not a report. Every agent should speak up with their perspective.
- **Always call 3+ agents** on any topic. Even if the topic seems technical-only, COO has operational input and Risk Critic should weigh in.
- For broad topics: call ALL 5 agents.
- Each agent should give their own distinct viewpoint, not repeat what others said.

## Output Format
Present each agent's response WITH their name, like a real meeting transcript:

**COO**: (their operational perspective)

**CSO**: (their strategic perspective)

**CTO**: (their technical perspective)

**Risk Critic**: (risks they see)

**Verifier**: (what needs to be verified)

After all agents speak, add a brief facilitator summary:

📋 **회의 요약**
- 합의된 사항
- 결정이 필요한 사항
- 다음 액션

## Rules
1. Always respond in Korean.
2. Each agent speaks in first person from their role's perspective.
3. Agents may disagree — that's valuable. Don't flatten disagreements.
4. If Risk Critic raises a Red Flag, mark it prominently with 🔴.
5. If Verifier blocks something, mark it with ⚠️.
6. Use section emoji headers sparingly. Keep body text emoji-free.
7. Use **bold** for key terms and bullet points for structure.`,
    model: MODEL,
    agents: agentsMap,
    defaultOptions: {
      maxSteps: 15,
    },
  })

  return { supervisor, coreAgents }
}
