create table public.projects (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'archived', 'completed')),
  phase text not null default 'discovery' check (phase in ('discovery', 'planning', 'building', 'review', 'shipping', 'archived')),
  last_opened_at timestamptz,
  floorplan_state jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_user_id, slug)
);

create trigger set_projects_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create table public.agent_templates (
  id bigint generated always as identity primary key,
  key text not null unique,
  name text not null,
  role_title text not null,
  layer text not null check (layer in ('strategic_core', 'review_core', 'support_execution', 'specialist')),
  default_scope_type text not null default 'project' check (default_scope_type in ('workspace', 'project')),
  default_presence_mode text not null default 'on_demand' check (default_presence_mode in ('always_on', 'on_demand', 'manual')),
  default_is_core_member boolean not null default false,
  default_can_raise_red_flag boolean not null default false,
  default_can_block boolean not null default false,
  default_can_verify boolean not null default false,
  default_system_prompt_md text,
  default_config jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_agent_templates_updated_at
before update on public.agent_templates
for each row
execute function public.set_updated_at();

insert into public.agent_templates (
  key,
  name,
  role_title,
  layer,
  default_scope_type,
  default_presence_mode,
  default_is_core_member,
  default_can_raise_red_flag,
  default_can_block,
  default_can_verify
)
values
  ('coo', 'COO', 'Operations Director', 'strategic_core', 'project', 'always_on', true, false, false, false),
  ('cso', 'CSO', 'Strategy Planner', 'strategic_core', 'project', 'always_on', true, false, false, false),
  ('cto', 'CTO', 'Technical Lead', 'strategic_core', 'project', 'always_on', true, false, false, false),
  ('risk_critic', 'Risk Critic', 'Adversarial Reviewer', 'review_core', 'project', 'always_on', true, true, true, false),
  ('verifier', 'Verifier', 'Verification Lead', 'review_core', 'project', 'always_on', true, false, true, true),
  ('documentation_manager', 'Documentation Manager', 'Documentation Manager', 'support_execution', 'workspace', 'always_on', false, false, false, false),
  ('builder', 'Builder', 'Implementation Lead', 'support_execution', 'project', 'on_demand', false, false, false, false),
  ('brand_designer', 'Brand Designer', 'Brand Designer', 'specialist', 'workspace', 'on_demand', false, false, false, false),
  ('content_creator', 'Content Creator', 'Content Creator', 'specialist', 'project', 'on_demand', false, false, false, false),
  ('trend_scout', 'Trend Scout', 'Trend Scout', 'specialist', 'workspace', 'on_demand', false, false, false, false);

create table public.agent_instances (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  agent_template_id bigint references public.agent_templates(id) on delete set null,
  scope_type text not null check (scope_type in ('workspace', 'project')),
  project_id bigint references public.projects(id) on delete cascade,
  key text not null,
  name text not null,
  role_title text not null,
  presence_mode text not null default 'on_demand' check (presence_mode in ('always_on', 'on_demand', 'manual')),
  is_core_member boolean not null default false,
  can_raise_red_flag boolean not null default false,
  can_block boolean not null default false,
  can_verify boolean not null default false,
  persona_override_md text,
  config jsonb not null default '{}'::jsonb,
  display_order integer not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (scope_type = 'workspace' and project_id is null)
    or
    (scope_type = 'project' and project_id is not null)
  )
);

create trigger set_agent_instances_updated_at
before update on public.agent_instances
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.agent_instances (
    owner_user_id,
    agent_template_id,
    scope_type,
    key,
    name,
    role_title,
    presence_mode,
    is_core_member,
    can_raise_red_flag,
    can_block,
    can_verify,
    config
  )
  select
    new.id,
    t.id,
    'workspace',
    t.key,
    t.name,
    t.role_title,
    t.default_presence_mode,
    t.default_is_core_member,
    t.default_can_raise_red_flag,
    t.default_can_block,
    t.default_can_verify,
    t.default_config
  from public.agent_templates t
  where t.default_scope_type = 'workspace'
    and not exists (
      select 1
      from public.agent_instances ai
      where ai.owner_user_id = new.id
        and ai.scope_type = 'workspace'
        and ai.key = t.key
    );

  return new;
end;
$$;

insert into public.agent_instances (
  owner_user_id,
  agent_template_id,
  scope_type,
  key,
  name,
  role_title,
  presence_mode,
  is_core_member,
  can_raise_red_flag,
  can_block,
  can_verify,
  config
)
select
  p.id,
  t.id,
  'workspace',
  t.key,
  t.name,
  t.role_title,
  t.default_presence_mode,
  t.default_is_core_member,
  t.default_can_raise_red_flag,
  t.default_can_block,
  t.default_can_verify,
  t.default_config
from public.profiles p
join public.agent_templates t
  on t.default_scope_type = 'workspace'
where not exists (
  select 1
  from public.agent_instances ai
  where ai.owner_user_id = p.id
    and ai.scope_type = 'workspace'
    and ai.key = t.key
);
