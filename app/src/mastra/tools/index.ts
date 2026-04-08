import { webSearch } from './web-search'
import { webFetch } from './web-fetch'
import { queryDecisions } from './query-decisions'
import { queryActionItems } from './query-action-items'
import { queryNotes } from './query-notes'
import { createDecision } from './create-decision'
import { createActionItem } from './create-action-item'
import { createNote } from './create-note'
import { searchVault } from './search-vault'
import { deepResearch } from './deep-research'

export {
  webSearch, webFetch,
  queryDecisions, queryActionItems, queryNotes,
  createDecision, createActionItem, createNote,
  searchVault, deepResearch,
}

const webTools = { webSearch, webFetch }

const supabaseReadTools = {
  queryDecisions,
  queryActionItems,
  queryNotes,
}

const supabaseWriteTools = {
  createDecision,
  createActionItem,
  createNote,
}

const vaultTools = { searchVault }

const AGENT_TOOLS: Record<string, Record<string, any>> = {
  coo:                   { ...webTools, ...supabaseReadTools, ...supabaseWriteTools, ...vaultTools },
  cso:                   { ...webTools, ...supabaseReadTools, ...supabaseWriteTools, ...vaultTools },
  cto:                   { ...webTools, ...supabaseReadTools, ...supabaseWriteTools, ...vaultTools },
  risk_critic:           { ...webTools, ...supabaseReadTools, ...supabaseWriteTools },
  verifier:              { ...webTools, ...supabaseReadTools, ...supabaseWriteTools },
  documentation_manager: { ...webTools, ...supabaseReadTools, ...supabaseWriteTools, ...vaultTools },
  builder:               { ...webTools, ...supabaseReadTools, ...supabaseWriteTools, ...vaultTools },
  brand_designer:        { ...webTools, queryNotes, ...supabaseWriteTools },
  content_creator:       { ...webTools, queryNotes, ...supabaseWriteTools },
  trend_scout:           { ...webTools, queryDecisions, queryNotes, ...supabaseWriteTools, ...vaultTools, deepResearch },
}

export function getToolsForAgent(agentKey: string): Record<string, any> {
  return AGENT_TOOLS[agentKey] ?? { ...supabaseReadTools }
}
