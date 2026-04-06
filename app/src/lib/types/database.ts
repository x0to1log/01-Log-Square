// ============================================
// TypeScript types matching supabase/migrations/00001–00007
// ============================================

// --- Enums (from SQL check constraints) ---

export type ProjectStatus = 'active' | 'paused' | 'archived' | 'completed'
export type ProjectPhase = 'discovery' | 'planning' | 'building' | 'review' | 'shipping' | 'archived'

export type AgentLayer = 'strategic_core' | 'review_core' | 'support_execution' | 'specialist'
export type ScopeType = 'workspace' | 'project'
export type PresenceMode = 'always_on' | 'on_demand' | 'manual'

export type ThreadType = 'war_room' | 'direct_message' | 'briefing' | 'system'
export type MembershipRole = 'core' | 'invited' | 'observer'

export type SenderType = 'representative' | 'agent' | 'system'
export type MessageKind = 'chat' | 'summary' | 'decision_candidate' | 'action_candidate' | 'review_notice' | 'system'

export type DecisionStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'superseded'
export type ReviewStatus = 'not_requested' | 'pending' | 'passed' | 'blocked' | 'overridden'

export type ActionStatus = 'open' | 'in_progress' | 'blocked' | 'done' | 'cancelled'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type AssigneeType = 'representative' | 'agent' | 'unassigned'
export type VerificationStatus = 'not_requested' | 'pending' | 'passed' | 'blocked' | 'overridden'

export type NoteType = 'meeting_note' | 'brief' | 'reference' | 'summary' | 'sop' | 'journal'
export type NoteStatus = 'draft' | 'active' | 'archived'
export type SavedByType = 'representative' | 'agent' | 'system'

export type ReviewKind = 'risk' | 'verification'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type ReviewResult = 'warning' | 'pass' | 'fail' | 'blocked'
export type ReviewStatusValue = 'open' | 'resolved' | 'accepted' | 'rejected' | 'overridden'

export type ActorType = 'representative' | 'agent' | 'system'

// --- Row types ---

export interface Profile {
  id: string // uuid
  display_name: string | null
  role_title: string
  timezone: string
  locale: string
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Project {
  id: number
  owner_user_id: string
  slug: string
  name: string
  description: string | null
  status: ProjectStatus
  phase: ProjectPhase
  last_opened_at: string | null
  floorplan_state: Record<string, unknown>
  metadata: Record<string, unknown>
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface AgentTemplate {
  id: number
  key: string
  name: string
  role_title: string
  layer: AgentLayer
  default_scope_type: ScopeType
  default_presence_mode: PresenceMode
  default_is_core_member: boolean
  default_can_raise_red_flag: boolean
  default_can_block: boolean
  default_can_verify: boolean
  default_system_prompt_md: string | null
  default_config: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AgentInstance {
  id: number
  owner_user_id: string
  agent_template_id: number | null
  scope_type: ScopeType
  project_id: number | null
  key: string
  name: string
  role_title: string
  presence_mode: PresenceMode
  is_core_member: boolean
  can_raise_red_flag: boolean
  can_block: boolean
  can_verify: boolean
  persona_override_md: string | null
  config: Record<string, unknown>
  display_order: number
  last_active_at: string | null
  created_at: string
  updated_at: string
}

export interface Thread {
  id: number
  owner_user_id: string
  scope_type: ScopeType
  project_id: number | null
  thread_type: ThreadType
  title: string
  direct_agent_instance_id: number | null
  is_default: boolean
  last_message_at: string | null
  archived_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ThreadAgentMembership {
  id: number
  owner_user_id: string
  thread_id: number
  agent_instance_id: number
  membership_role: MembershipRole
  is_active: boolean
  joined_at: string
  left_at: string | null
  created_at: string
}

export interface Message {
  id: number
  owner_user_id: string
  thread_id: number
  sender_type: SenderType
  sender_agent_instance_id: number | null
  message_kind: MessageKind
  body_md: string
  structured_payload: Record<string, unknown>
  reply_to_message_id: number | null
  edited_at: string | null
  created_at: string
}

export interface Decision {
  id: number
  owner_user_id: string
  project_id: number
  source_thread_id: number | null
  source_message_id: number | null
  title: string
  summary_md: string
  status: DecisionStatus
  review_status: ReviewStatus
  approved_at: string | null
  approved_by_user_id: string | null
  override_reason: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ActionItem {
  id: number
  owner_user_id: string
  project_id: number
  source_thread_id: number | null
  source_message_id: number | null
  decision_id: number | null
  title: string
  description_md: string
  status: ActionStatus
  priority: Priority
  assignee_type: AssigneeType
  assignee_agent_instance_id: number | null
  due_at: string | null
  verification_required: boolean
  verification_status: VerificationStatus
  completed_at: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Note {
  id: number
  owner_user_id: string
  project_id: number
  note_type: NoteType
  title: string
  body_md: string
  source_thread_id: number | null
  status: NoteStatus
  latest_revision_no: number
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface NoteRevision {
  id: number
  owner_user_id: string
  note_id: number
  revision_no: number
  body_md: string
  summary: string | null
  saved_by_type: SavedByType
  saved_by_agent_instance_id: number | null
  created_at: string
}

export interface Review {
  id: number
  owner_user_id: string
  project_id: number
  review_kind: ReviewKind
  target_decision_id: number | null
  target_action_item_id: number | null
  target_note_id: number | null
  raised_by_agent_instance_id: number
  title: string
  summary: string
  details_md: string
  severity: Severity | null
  result: ReviewResult
  status: ReviewStatusValue
  requires_recheck: boolean
  resolved_at: string | null
  resolved_by_user_id: string | null
  resolution_note: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// --- Event tables ---

export interface ThreadEvent {
  id: number
  owner_user_id: string
  thread_id: number
  event_type: string
  actor_type: ActorType
  actor_agent_instance_id: number | null
  note_md: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface DecisionEvent {
  id: number
  owner_user_id: string
  decision_id: number
  event_type: string
  actor_type: ActorType
  actor_agent_instance_id: number | null
  from_status: string | null
  to_status: string | null
  note_md: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface ActionItemEvent {
  id: number
  owner_user_id: string
  action_item_id: number
  event_type: string
  actor_type: ActorType
  actor_agent_instance_id: number | null
  from_status: string | null
  to_status: string | null
  note_md: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface ReviewEvent {
  id: number
  owner_user_id: string
  review_id: number
  event_type: string
  actor_type: ActorType
  actor_agent_instance_id: number | null
  from_status: string | null
  to_status: string | null
  note_md: string | null
  payload: Record<string, unknown>
  created_at: string
}

// --- Supabase Database type ---

type TableDef<R> = { Row: R; Insert: Partial<R>; Update: Partial<R> }

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<Profile>
      projects: TableDef<Project>
      agent_templates: TableDef<AgentTemplate>
      agent_instances: TableDef<AgentInstance>
      threads: TableDef<Thread>
      thread_agent_memberships: TableDef<ThreadAgentMembership>
      messages: TableDef<Message>
      decisions: TableDef<Decision>
      action_items: TableDef<ActionItem>
      notes: TableDef<Note>
      note_revisions: TableDef<NoteRevision>
      reviews: TableDef<Review>
      thread_events: TableDef<ThreadEvent>
      decision_events: TableDef<DecisionEvent>
      action_item_events: TableDef<ActionItemEvent>
      review_events: TableDef<ReviewEvent>
    }
    Functions: {
      bootstrap_project: {
        Args: { target_project_id: number }
        Returns: void
      }
    }
  }
}
