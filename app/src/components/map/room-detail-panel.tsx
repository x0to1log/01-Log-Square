'use client'

import Link from 'next/link'
import type { AgentInstance } from '@/lib/types/database'
import type { RoomDef } from './room-card'
import { useViewMode } from '@/components/ui/view-mode-context'

/* ------------------------------------------------------------------ */
/*  RoomDetailPanel                                                    */
/* ------------------------------------------------------------------ */

interface RoomDetailPanelProps {
  room: RoomDef
  agents: AgentInstance[]
  projectId: number
  ceoHere?: boolean
  onClose: () => void
}

export function RoomDetailPanel({
  room,
  agents,
  projectId,
  ceoHere = false,
  onClose,
}: RoomDetailPanelProps) {
  const { setMode } = useViewMode()

  const roomAgents = agents.filter((a) => room.agentKeys.includes(a.key))

  const handleEnter = () => {
    setMode('conversation')
  }

  return (
    <>
      {/* ---- Desktop: right side panel ---- */}
      <aside className="hidden lg:flex w-[340px] shrink-0 flex-col border-l border-border bg-background">
        <PanelContent
          room={room}
          roomAgents={roomAgents}
          projectId={projectId}
          ceoHere={ceoHere}
          onClose={onClose}
          onEnter={handleEnter}
        />
      </aside>

      {/* ---- Mobile: bottom sheet ---- */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-background shadow-lg lg:hidden">
        <PanelContent
          room={room}
          roomAgents={roomAgents}
          projectId={projectId}
          ceoHere={ceoHere}
          onClose={onClose}
          onEnter={handleEnter}
        />
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  Shared inner content                                               */
/* ------------------------------------------------------------------ */

function PanelContent({
  room,
  roomAgents,
  projectId,
  ceoHere,
  onClose,
  onEnter,
}: {
  room: RoomDef
  roomAgents: AgentInstance[]
  projectId: number
  ceoHere: boolean
  onClose: () => void
  onEnter: () => void
}) {
  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {room.name}
          </h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {room.description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-foreground-muted hover:text-foreground"
          aria-label="닫기"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1={18} y1={6} x2={6} y2={18} />
            <line x1={6} y1={6} x2={18} y2={18} />
          </svg>
        </button>
      </div>

      {/* Agent list */}
      <div className="flex flex-col gap-3">
        {ceoHere && (
          <div className="flex items-center gap-3">
            <img
              src="/sprites/characters/ceo/south.png"
              alt="CEO"
              width={48}
              height={48}
              className="pixel-art rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                대표
              </p>
              <p className="text-xs text-foreground-muted">CEO</p>
            </div>
          </div>
        )}
        {roomAgents.map((agent) => (
          <div key={agent.id} className="flex items-center gap-3">
            <img
              src={`/sprites/characters/${agent.key}/south.png`}
              alt={agent.name}
              width={48}
              height={48}
              className="pixel-art rounded-full"
            />
            <div>
              <p className="text-sm font-medium text-foreground">
                {agent.name}
              </p>
              <p className="text-xs text-foreground-muted">
                {agent.role_title}
              </p>
            </div>
          </div>
        ))}
        {roomAgents.length === 0 && !ceoHere && (
          <p className="text-sm text-foreground-muted">
            배치된 에이전트가 없습니다
          </p>
        )}
      </div>

      {/* Enter button */}
      {room.id === 'meeting-room' ? (
        <Link
          href={`/project/${projectId}`}
          onClick={onEnter}
          className="mt-2 flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
        >
          들어가기
        </Link>
      ) : (
        <button
          type="button"
          onClick={onEnter}
          className="mt-2 flex items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent-hover"
        >
          들어가기
        </button>
      )}
    </div>
  )
}
