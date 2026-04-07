import { createServerClient } from '@/lib/supabase/server'

const DAILY_BUDGET_CENTS = Number(process.env.AI_DAILY_BUDGET_CENTS ?? '1000') // $10 default

/**
 * Check if daily AI budget is exceeded.
 * Returns { allowed: true } or { allowed: false, spent, limit }.
 */
export async function checkDailyBudget(): Promise<
  | { allowed: true }
  | { allowed: false; spent: number; limit: number }
> {
  const supabase = createServerClient()
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

  const { data } = await supabase
    .from('ai_usage_logs')
    .select('estimated_cost_cents')
    .gte('created_at', `${today}T00:00:00Z`)
    .lte('created_at', `${today}T23:59:59Z`) as { data: { estimated_cost_cents: number }[] | null }

  const spent = (data ?? []).reduce((sum, r) => sum + (r.estimated_cost_cents ?? 0), 0)

  if (spent >= DAILY_BUDGET_CENTS) {
    return { allowed: false, spent, limit: DAILY_BUDGET_CENTS }
  }
  return { allowed: true }
}

/**
 * Log an AI API call for budget tracking.
 */
export async function logAiUsage(params: {
  model: string
  agent_key: string
  project_id: number
  input_tokens?: number
  output_tokens?: number
}) {
  const supabase = createServerClient()

  // Rough cost estimation (cents)
  const isGpt5 = params.model.includes('gpt-5') && !params.model.includes('mini') && !params.model.includes('nano')
  const inputTokens = params.input_tokens ?? 0
  const outputTokens = params.output_tokens ?? 0

  // gpt-5: ~$5/1M input, ~$15/1M output → 0.5c/1K in, 1.5c/1K out
  // gpt-5-mini: ~$0.4/1M input, ~$1.6/1M output → 0.04c/1K in, 0.16c/1K out
  const costPer1kIn = isGpt5 ? 0.5 : 0.04
  const costPer1kOut = isGpt5 ? 1.5 : 0.16
  const estimatedCostCents = (inputTokens / 1000) * costPer1kIn + (outputTokens / 1000) * costPer1kOut

  await supabase.from('ai_usage_logs').insert({
    model: params.model,
    agent_key: params.agent_key,
    project_id: params.project_id,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    estimated_cost_cents: Math.round(estimatedCostCents * 100) / 100,
  }).then(({ error }) => {
    if (error) console.error('[AI Budget] Log failed:', error.message)
  })
}
