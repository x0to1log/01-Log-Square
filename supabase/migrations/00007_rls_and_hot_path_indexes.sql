alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.agent_templates enable row level security;
alter table public.agent_instances enable row level security;
alter table public.threads enable row level security;
alter table public.thread_agent_memberships enable row level security;
alter table public.messages enable row level security;
alter table public.decisions enable row level security;
alter table public.action_items enable row level security;
alter table public.notes enable row level security;
alter table public.note_revisions enable row level security;
alter table public.reviews enable row level security;
alter table public.thread_events enable row level security;
alter table public.decision_events enable row level security;
alter table public.action_item_events enable row level security;
alter table public.review_events enable row level security;

create policy profiles_read_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

revoke update on public.profiles from anon, authenticated;
grant update (display_name, role_title, timezone, locale, preferences) on public.profiles to authenticated;

create policy projects_manage_own
on public.projects
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy agent_templates_read_authenticated
on public.agent_templates
for select
to authenticated
using (true);

create policy agent_instances_manage_own
on public.agent_instances
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy threads_manage_own
on public.threads
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy thread_agent_memberships_manage_own
on public.thread_agent_memberships
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy messages_manage_own
on public.messages
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy decisions_manage_own
on public.decisions
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy action_items_manage_own
on public.action_items
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy notes_manage_own
on public.notes
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy note_revisions_manage_own
on public.note_revisions
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy reviews_manage_own
on public.reviews
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy thread_events_manage_own
on public.thread_events
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy decision_events_manage_own
on public.decision_events
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy action_item_events_manage_own
on public.action_item_events
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create policy review_events_manage_own
on public.review_events
for all
to authenticated
using ((select auth.uid()) = owner_user_id)
with check ((select auth.uid()) = owner_user_id);

create unique index uq_agent_instances_workspace_key
on public.agent_instances (owner_user_id, key)
where scope_type = 'workspace';

create unique index uq_agent_instances_project_key
on public.agent_instances (owner_user_id, project_id, key)
where scope_type = 'project';

create index idx_projects_owner_status_updated
on public.projects (owner_user_id, status, updated_at desc);

create index idx_agent_instances_owner_scope_project_order
on public.agent_instances (owner_user_id, scope_type, project_id, display_order);

create index idx_threads_project_last_message
on public.threads (project_id, last_message_at desc)
where project_id is not null and archived_at is null;

create index idx_threads_owner_type_last_message
on public.threads (owner_user_id, thread_type, last_message_at desc)
where archived_at is null;

create unique index uq_threads_active_meeting_room_per_project
on public.threads (project_id)
where thread_type = 'meeting_room' and archived_at is null;

create unique index uq_threads_active_dm_per_scope_agent
on public.threads (owner_user_id, scope_type, coalesce(project_id, -1::bigint), direct_agent_instance_id)
where thread_type = 'direct_message' and archived_at is null;

create index idx_thread_agent_memberships_thread_active
on public.thread_agent_memberships (thread_id, is_active);

create index idx_messages_thread_created
on public.messages (thread_id, created_at desc);

create index idx_decisions_project_status_created
on public.decisions (project_id, status, created_at desc);

create index idx_action_items_project_status_due
on public.action_items (project_id, status, due_at asc nulls last);

create index idx_notes_project_type_updated
on public.notes (project_id, note_type, updated_at desc);

create index idx_note_revisions_note_revision
on public.note_revisions (note_id, revision_no desc);

create index idx_reviews_project_status_kind
on public.reviews (project_id, status, review_kind);

create index idx_reviews_target_decision
on public.reviews (target_decision_id)
where target_decision_id is not null;

create index idx_reviews_target_action_item
on public.reviews (target_action_item_id)
where target_action_item_id is not null;

create index idx_reviews_target_note
on public.reviews (target_note_id)
where target_note_id is not null;

create index idx_thread_events_thread_created
on public.thread_events (thread_id, created_at desc);

create index idx_decision_events_decision_created
on public.decision_events (decision_id, created_at desc);

create index idx_action_item_events_action_item_created
on public.action_item_events (action_item_id, created_at desc);

create index idx_review_events_review_created
on public.review_events (review_id, created_at desc);

