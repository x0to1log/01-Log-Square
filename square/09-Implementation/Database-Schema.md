---
title: Database Schema
date: 2026-04-06
updated: 2026-04-06
tags:
  - implementation
  - database
  - schema
  - supabase
---

# Database Schema

01 Log Square v1 database schema is split into sequential Supabase migrations under `supabase/migrations`, following the same broad pattern as Idea Mine:

1. base extensions and profile bootstrap
2. core domain tables
3. operational workflow tables
4. event logs and helper RPC
5. RLS and hot-path indexes
6. agent runtime integration (Mastra)

## Migration Files

- `00001_base_extensions_profiles.sql`
  - `pgcrypto`
  - `set_updated_at()`
  - `profiles`
  - `handle_new_user()` trigger

- `00002_projects_and_agents.sql`
  - `projects`
  - `agent_templates`
  - `agent_instances`
  - workspace-scoped default agent backfill

- `00003_threads_and_messages.sql`
  - `threads`
  - `thread_agent_memberships`
  - `messages`

- `00004_decisions_and_actions.sql`
  - `decisions`
  - `action_items`

- `00005_notes_and_reviews.sql`
  - `notes`
  - `note_revisions`
  - `reviews`

- `00006_event_logs_and_bootstrap_rpc.sql`
  - `thread_events`
  - `decision_events`
  - `action_item_events`
  - `review_events`
  - `bootstrap_project(bigint)`

- `00007_rls_and_hot_path_indexes.sql`
  - row level security enablement
  - owner-scoped policies
  - active thread / review / timeline indexes
  - partial unique indexes for workspace and project agent instances

## Model Decisions

### 1. Current State + Event Log

Operational tables keep the current state.
Important state transitions are appended to dedicated `*_events` tables.

This keeps the live UI simple while preserving the reasoning trail behind:

- approvals
- overrides
- blocked reviews
- thread-level system events

### 2. Global Agents + Project Agents

The schema separates:

- `agent_templates`
  - global role archetypes such as COO, Risk Critic, Verifier
- `agent_instances`
  - actual instantiated agents, scoped to either `workspace` or `project`

This supports both:

- agents that oversee the entire office
- agents created specifically for a single project

### 3. Review Roles Are System Roles

`Risk Critic` and `Verifier` are not just chat participants.
They create structured records in `reviews`.

- `review_kind = risk`
  - adversarial critique, risk, blocking concern
- `review_kind = verification`
  - pass/fail checklist and validation outcome

Reviews can target exactly one object:

- decision
- action item
- note

### 4. Project Bootstrap

`bootstrap_project(bigint)` is included so the app can provision:

- default project-scoped agent instances
- the project War Room
- core memberships
- direct-message threads for project agents

This keeps the app bootstrap flow out of ad hoc frontend logic.

Note: `bootstrap_project` provisions Supabase product state only. Mastra agent sessions are initialized separately when a user first enters a thread. This is intentional — Supabase state is persistent, Mastra sessions are transient.

### 5. Agent Runtime Integration

`00008_agent_runtime_integration.sql` adds columns and structures needed for the Mastra-based agent runtime.

- `messages.delivery_status`
  - tracks agent response lifecycle: `pending` → `streaming` → `delivered` → `failed`
  - enables Supabase Realtime-based typing indicators without polling
- `agent_instances.persona_version`
  - integer version counter for SOUL/persona changes
  - allows tracing which persona version was active for any given message
- `agent_instances.soul_synced_at`
  - records when the persona was last pushed to the Mastra runtime
  - detects stale sessions where the running agent is out of sync with Supabase

These additions follow the core principle: **Supabase is the product's source of truth. Mastra is the agent runtime.** The schema does not store Mastra-internal session state. It stores the product-relevant metadata needed to bridge the two systems.

## Related

- [[Tech-Stack]]
- [[Implementation-Plan]]
- [[Agent-Team]]
