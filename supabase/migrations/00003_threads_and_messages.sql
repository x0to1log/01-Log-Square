create table public.threads (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  scope_type text not null check (scope_type in ('workspace', 'project')),
  project_id bigint references public.projects(id) on delete cascade,
  thread_type text not null check (thread_type in ('meeting_room', 'direct_message', 'briefing', 'system')),
  title text not null,
  direct_agent_instance_id bigint references public.agent_instances(id) on delete restrict,
  is_default boolean not null default false,
  last_message_at timestamptz,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scope_type = 'workspace' and project_id is null)
    or
    (scope_type = 'project' and project_id is not null)
  ),
  check (
    thread_type <> 'direct_message'
    or direct_agent_instance_id is not null
  ),
  check (
    thread_type <> 'meeting_room'
    or (scope_type = 'project' and project_id is not null)
  )
);

create trigger set_threads_updated_at
before update on public.threads
for each row
execute function public.set_updated_at();

create table public.thread_agent_memberships (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id bigint not null references public.threads(id) on delete cascade,
  agent_instance_id bigint not null references public.agent_instances(id) on delete cascade,
  membership_role text not null default 'invited' check (membership_role in ('core', 'invited', 'observer')),
  is_active boolean not null default true,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  unique (thread_id, agent_instance_id)
);

create table public.messages (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id bigint not null references public.threads(id) on delete cascade,
  sender_type text not null check (sender_type in ('representative', 'agent', 'system')),
  sender_agent_instance_id bigint references public.agent_instances(id) on delete set null,
  message_kind text not null default 'chat' check (message_kind in ('chat', 'summary', 'decision_candidate', 'action_candidate', 'review_notice', 'system')),
  body_md text not null default '',
  structured_payload jsonb not null default '{}'::jsonb,
  reply_to_message_id bigint references public.messages(id) on delete set null,
  edited_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (sender_type = 'agent' and sender_agent_instance_id is not null)
    or
    (sender_type in ('representative', 'system') and sender_agent_instance_id is null)
  )
);

