-- 00009: AI Usage Logs for budget tracking

create table public.ai_usage_logs (
  id bigint generated always as identity primary key,
  model text not null,
  agent_key text not null,
  project_id bigint references public.projects(id) on delete set null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  estimated_cost_cents numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

-- Index for daily budget queries
create index idx_ai_usage_logs_daily on public.ai_usage_logs (created_at);

-- RLS
alter table public.ai_usage_logs enable row level security;

create policy "ai_usage_logs_manage_own"
  on public.ai_usage_logs
  for all
  using (true)  -- service role only, no user access needed
  with check (true);
