-- 00010: Thread read status for unread message tracking

create table public.thread_read_status (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  thread_id bigint not null references public.threads(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  unique (user_id, thread_id)
);

create index idx_thread_read_status_user on public.thread_read_status (user_id);

alter table public.thread_read_status enable row level security;

create policy "thread_read_status_manage_own"
  on public.thread_read_status
  for all
  using (true)
  with check (true);
