import { webSearch } from './web-search'
import { webFetch } from './web-fetch'
import { queryDecisions } from './query-decisions'
import { queryActionItems } from './query-action-items'
import { queryNotes } from './query-notes'

export { webSearch, webFetch, queryDecisions, queryActionItems, queryNotes }

const supabaseReadTools = {
  queryDecisions,
  queryActionItems,
  queryNotes,
}

const webTools = { webSearch, webFetch }

const AGENT_TOOLS: Record<string, Record<string, any>> = {
  coo: { ...webTools, ...supabaseReadTools },
  cso: { ...webTools, ...supabaseReadTools },
  cto: { ...webTools, ...supabaseReadTools },
  risk_critic: { ...webTools, ...supabaseReadTools },
  verifier: { ...webTools, ...supabaseReadTools },
  documentation_manager: { ...webTools, ...supabaseReadTools },
  builder: { ...webTools, ...supabaseReadTools },
  brand_designer: { ...webTools, queryNotes },
  content_creator: { ...webTools, queryNotes },
  trend_scout: { ...webTools, queryDecisions, queryNotes },
}

export function getToolsForAgent(agentKey: string): Record<string, any> {
  return AGENT_TOOLS[agentKey] ?? { ...supabaseReadTools }
}
