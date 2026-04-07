'use client'

import type { AgentInstance } from '@/lib/types/database'

/* ------------------------------------------------------------------ */
/*  Room definitions                                                   */
/* ------------------------------------------------------------------ */

export interface RoomDef {
  id: string
  name: string
  description: string
  themeColor: string   // hex
  themeOpacity: number // 0–1
  agentKeys: string[]  // agents that belong here by default
}

export const ROOMS: RoomDef[] = [
  {
    id: 'meeting-room',
    name: 'The Meeting Room',
    description: '핵심 안건을 다루는 공식 회의 공간',
    themeColor: '#08090E',
    themeOpacity: 0.1,
    agentKeys: ['coo', 'cso', 'cto', 'risk_critic', 'verifier'],
  },
  {
    id: 'individual-zones',
    name: 'The Individual Zones',
    description: '각 에이전트와 1:1로 대화하는 업무 구역',
    themeColor: '#FFF5F7',
    themeOpacity: 0.15,
    agentKeys: [
      'documentation_manager',
      'builder',
      'brand_designer',
      'content_creator',
      'trend_scout',
    ],
  },
  {
    id: 'archive',
    name: 'The Archive',
    description: '회의록, 결정 로그, SOP를 보관하는 기록실',
    themeColor: '#F4F1EA',
    themeOpacity: 0.15,
    agentKeys: [],
  },
]

/* ------------------------------------------------------------------ */
/*  RoomCard component                                                 */
/* ------------------------------------------------------------------ */

interface RoomCardProps {
  room: RoomDef
  agents: AgentInstance[]
  ceoHere?: boolean
  selected?: boolean
  onClick?: () => void
}

export function RoomCard({
  room,
  agents,
  ceoHere = false,
  selected = false,
  onClick,
}: RoomCardProps) {
  // Filter agents that belong in this room
  const roomAgents = agents.filter((a) => room.agentKeys.includes(a.key))

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full rounded-xl border p-4 text-left transition-all
        hover:shadow-md focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-border-hover
        ${
          selected
            ? 'border-border-hover shadow-md'
            : 'border-border'
        }
      `}
      style={{
        backgroundColor: `${room.themeColor}${Math.round(room.themeOpacity * 255)
          .toString(16)
          .padStart(2, '0')}`,
      }}
    >
      {/* Room name & description */}
      <h3 className="text-sm font-semibold text-foreground">
        {room.name}
      </h3>
      <p className="mt-1 text-xs text-foreground-muted">
        {room.description}
      </p>

      {/* Agent avatars */}
      {(roomAgents.length > 0 || ceoHere) && (
        <div className="mt-3 flex items-center -space-x-2">
          {ceoHere && (
            <img
              src="/sprites/characters/ceo/south.png"
              alt="CEO"
              width={24}
              height={24}
              className="pixel-art rounded-full border-2 border-background"
            />
          )}
          {roomAgents.map((agent) => (
            <img
              key={agent.id}
              src={`/sprites/characters/${agent.key}/south.png`}
              alt={agent.name}
              width={24}
              height={24}
              className="pixel-art rounded-full border-2 border-background"
            />
          ))}
        </div>
      )}
    </button>
  )
}
