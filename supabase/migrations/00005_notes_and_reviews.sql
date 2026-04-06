create table public.notes (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  project_id bigint not null references public.projects(id) on delete cascade,
  note_type text not null default 'meeting_note' check (note_type in ('meeting_note', 'brief', 'reference', 'summary', 'sop', 'journal')),
  title text not null,
  body_md text not null default '',
  source_thread_id bigint references public.threads(id) on delete set null,
  status text not null default 'active' check (status in ('draft', 'active', 'archived')),
  latest_revision_no integer not null default 1 check (latest_revision_no >= 1),
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_notes_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

create table public.note_revisions (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  note_id bigint not null references public.notes(id) on delete cascade,
  revision_no integer not null check (revision_no >= 1),
  body_md text not null,
  summary text,
  saved_by_type text not null check (saved_by_type in ('representative', 'agent', 'system')),
  saved_by_agent_instance_id bigint references public.agent_instances(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (note_id, revision_no),
  check (
    (saved_by_type = 'agent' and saved_by_agent_instance_id is not null)
    or
    (saved_by_type in ('representative', 'system') and saved_by_agent_instance_id is null)
  )
);

create table public.reviews (
  id bigint generated always as identity primary key,
  owner_user_id uuid not null references public.profiles(id) on delete cascade,
  project_id bigint not null references public.projects(id) on delete cascade,
  review_kind text not null check (review_kind in ('risk', 'verification')),
  target_decision_id bigint references public.decisions(id) on delete cascade,
  target_action_item_id bigint references public.action_items(id) on delete cascade,
  target_note_id bigint references public.notes(id) on delete cascade,
  raised_by_agent_instance_id bigint not null references public.agent_instances(id) on delete restrict,
  title text not null,
  summary text not null,
  details_md text not null default '',
  severity text check (severity is null or severity in ('low', 'medium', 'high', 'critical')),
  result text not null default 'warning' check (result in ('warning', 'pass', 'fail', 'blocked')),
  status text not null default 'open' check (status in ('open', 'resolved', 'accepted', 'rejected', 'overridden')),
  requires_recheck boolean not null default false,
  resolved_at timestamptz,
  resolved_by_user_id uuid references public.profiles(id) on delete set null,
  resolution_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(target_decision_id, target_action_item_id, target_note_id) = 1)
);

create trigger set_reviews_updated_at
before update on public.reviews
for each row
execute function public.set_updated_at();
