create table public.decisions (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  project_id bigint not null references public.projects(id) on delete cascade,
  source_thread_id bigint references public.threads(id) on delete set null,
  source_message_id bigint references public.messages(id) on delete set null,
  title text not null,
  summary_md text not null default '',
  status text not null default 'draft' check (status in ('draft', 'pending_review', 'approved', 'rejected', 'superseded')),
  review_status text not null default 'not_requested' check (review_status in ('not_requested', 'pending', 'passed', 'blocked', 'overridden')),
  approved_at timestamptz,
  approved_by_user_id uuid references public.profiles(id) on delete set null,
  override_reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_decisions_updated_at
before update on public.decisions
for each row
execute function public.set_updated_at();

create table public.action_items (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  project_id bigint not null references public.projects(id) on delete cascade,
  source_thread_id bigint references public.threads(id) on delete set null,
  source_message_id bigint references public.messages(id) on delete set null,
  decision_id bigint references public.decisions(id) on delete set null,
  title text not null,
  description_md text not null default '',
  status text not null default 'open' check (status in ('open', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  assignee_type text not null default 'unassigned' check (assignee_type in ('representative', 'agent', 'unassigned')),
  assignee_agent_instance_id bigint references public.agent_instances(id) on delete set null,
  due_at timestamptz,
  verification_required boolean not null default false,
  verification_status text not null default 'not_requested' check (verification_status in ('not_requested', 'pending', 'passed', 'blocked', 'overridden')),
  completed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (assignee_type = 'agent' and assignee_agent_instance_id is not null)
    or
    (assignee_type in ('representative', 'unassigned') and assignee_agent_instance_id is null)
  )
);

create trigger set_action_items_updated_at
before update on public.action_items
for each row
execute function public.set_updated_at();
