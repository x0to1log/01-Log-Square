create table public.thread_events (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id bigint not null references public.threads(id) on delete cascade,
  event_type text not null,
  actor_type text not null check (actor_type in ('representative', 'agent', 'system')),
  actor_agent_instance_id bigint references public.agent_instances(id) on delete set null,
  note_md text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (
    (actor_type = 'agent' and actor_agent_instance_id is not null)
    or
    (actor_type in ('representative', 'system') and actor_agent_instance_id is null)
  )
);

create table public.decision_events (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  decision_id bigint not null references public.decisions(id) on delete cascade,
  event_type text not null,
  actor_type text not null check (actor_type in ('representative', 'agent', 'system')),
  actor_agent_instance_id bigint references public.agent_instances(id) on delete set null,
  from_status text,
  to_status text,
  note_md text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (
    (actor_type = 'agent' and actor_agent_instance_id is not null)
    or
    (actor_type in ('representative', 'system') and actor_agent_instance_id is null)
  )
);

create table public.action_item_events (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  action_item_id bigint not null references public.action_items(id) on delete cascade,
  event_type text not null,
  actor_type text not null check (actor_type in ('representative', 'agent', 'system')),
  actor_agent_instance_id bigint references public.agent_instances(id) on delete set null,
  from_status text,
  to_status text,
  note_md text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (
    (actor_type = 'agent' and actor_agent_instance_id is not null)
    or
    (actor_type in ('representative', 'system') and actor_agent_instance_id is null)
  )
);

create table public.review_events (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  review_id bigint not null references public.reviews(id) on delete cascade,
  event_type text not null,
  actor_type text not null check (actor_type in ('representative', 'agent', 'system')),
  actor_agent_instance_id bigint references public.agent_instances(id) on delete set null,
  from_status text,
  to_status text,
  note_md text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (
    (actor_type = 'agent' and actor_agent_instance_id is not null)
    or
    (actor_type in ('representative', 'system') and actor_agent_instance_id is null)
  )
);

create or replace function public.bootstrap_project(target_project_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_owner uuid;
  war_room_thread_id bigint;
begin
  select p.owner_user_id
  into target_owner
  from public.projects p
  where p.id = target_project_id;

  if target_owner is null then
    raise exception 'Project not found';
  end if;

  if target_owner <> auth.uid() then
    raise exception 'Project access denied';
  end if;

  insert into public.agent_instances (
    owner_user_id,
    agent_template_id,
    scope_type,
    project_id,
    key,
    name,
    role_title,
    presence_mode,
    is_core_member,
    can_raise_red_flag,
    can_block,
    can_verify,
    config,
    display_order
  )
  select
    target_owner,
    t.id,
    'project',
    target_project_id,
    t.key,
    t.name,
    t.role_title,
    t.default_presence_mode,
    t.default_is_core_member,
    t.default_can_raise_red_flag,
    t.default_can_block,
    t.default_can_verify,
    t.default_config,
    row_number() over (order by t.id)::integer
  from public.agent_templates t
  where t.default_scope_type = 'project'
    and not exists (
      select 1
      from public.agent_instances ai
      where ai.owner_user_id = target_owner
        and ai.project_id = target_project_id
        and ai.key = t.key
    );

  select th.id
  into war_room_thread_id
  from public.threads th
  where th.owner_user_id = target_owner
    and th.project_id = target_project_id
    and th.thread_type = 'war_room'
    and th.archived_at is null
  order by th.id
  limit 1;

  if war_room_thread_id is null then
    insert into public.threads (
      owner_user_id,
      scope_type,
      project_id,
      thread_type,
      title,
      is_default,
      last_message_at
    )
    values (
      target_owner,
      'project',
      target_project_id,
      'war_room',
      'The War Room',
      true,
      now()
    )
    returning id into war_room_thread_id;
  end if;

  insert into public.thread_agent_memberships (
    owner_user_id,
    thread_id,
    agent_instance_id,
    membership_role,
    is_active
  )
  select
    target_owner,
    war_room_thread_id,
    ai.id,
    'core',
    true
  from public.agent_instances ai
  where ai.project_id = target_project_id
    and ai.is_core_member = true
    and not exists (
      select 1
      from public.thread_agent_memberships tam
      where tam.thread_id = war_room_thread_id
        and tam.agent_instance_id = ai.id
    );

  insert into public.threads (
    owner_user_id,
    scope_type,
    project_id,
    thread_type,
    title,
    direct_agent_instance_id,
    last_message_at
  )
  select
    target_owner,
    'project',
    target_project_id,
    'direct_message',
    ai.name,
    ai.id,
    now()
  from public.agent_instances ai
  where ai.project_id = target_project_id
    and not exists (
      select 1
      from public.threads th
      where th.owner_user_id = target_owner
        and th.project_id = target_project_id
        and th.thread_type = 'direct_message'
        and th.direct_agent_instance_id = ai.id
        and th.archived_at is null
    );
end;
$$;
