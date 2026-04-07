'use client'

import { useState } from 'react'
import type { AgentInstance } from '@/lib/types/database'
import type { RoomDef } from './room-card'
import { RoomDetailPanel } from './room-detail-panel'

interface Room extends RoomDef {
  agentPositions: { key: string }[]
}

const ROOMS: Room[] = [
  {
    id: 'meeting-room',
    name: 'The Meeting Room',
    description: '핵심 안건을 다루는 공식 회의 공간',
    themeColor: '#08090E',
    themeOpacity: 0.08,
    agentKeys: ['coo', 'cso', 'cto', 'risk_critic', 'verifier'],
    agentPositions: [
      { key: 'ceo' },
      { key: 'coo' },
      { key: 'cso' },
      { key: 'cto' },
      { key: 'risk_critic' },
      { key: 'verifier' },
    ],
  },
  {
    id: 'individual-zones',
    name: 'The Individual Zones',
    description: '각 에이전트와 1:1로 대화하는 업무 구역',
    themeColor: '#FFF5F7',
    themeOpacity: 0.12,
    agentKeys: ['documentation_manager', 'builder', 'brand_designer', 'content_creator', 'trend_scout'],
    agentPositions: [
      { key: 'documentation_manager' },
      { key: 'builder' },
      { key: 'brand_designer' },
      { key: 'content_creator' },
      { key: 'trend_scout' },
    ],
  },
  {
    id: 'archive',
    name: 'The Archive',
    description: '회의록, 결정 로그, SOP를 보관하는 기록실',
    themeColor: '#F4F1EA',
    themeOpacity: 0.12,
    agentKeys: [],
    agentPositions: [],
  },
  {
    id: 'lobby',
    name: 'The Lobby',
    description: '프로젝트 목록과 오늘의 우선순위를 보는 홈',
    themeColor: '#181412',
    themeOpacity: 0.08,
    agentKeys: [],
    agentPositions: [],
  },
]

function RoomTile({
  room,
  agents,
  isSelected,
  onClick,
}: {
  room: Room
  agents: AgentInstance[]
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex cursor-pointer flex-col rounded-xl border-2 p-4 text-left transition-all duration-200 ${
        isSelected
          ? 'border-accent shadow-lg shadow-accent/5'
          : 'border-border/50 hover:border-accent/30'
      }`}
      style={{
        backgroundColor: `${room.themeColor}${Math.round(room.themeOpacity * 255).toString(16).padStart(2, '0')}`,
      }}
    >
      <span className="mb-1 text-xs font-semibold text-foreground">
        {room.name}
      </span>
      <span className="mb-3 text-[10px] text-foreground-muted">
        {room.description}
      </span>

      {/* Agent catloafs — bigger, with hover names */}
      {room.agentPositions.length > 0 && (
        <div className="mt-auto grid grid-cols-3 gap-2 pt-1">
          {room.agentPositions.map((pos) => {
            const name = agents.find((a) => a.key === pos.key)?.name
              ?? (pos.key === 'ceo' ? '대표' : pos.key)
            return (
              <div key={pos.key} className="group/cat relative flex flex-col items-center">
                <img
                  src={`/sprites/characters/${pos.key}/south.png`}
                  alt={name}
                  className="pixel-art h-10 w-10 object-contain transition-transform duration-150 group-hover/cat:scale-110 sm:h-12 sm:w-12"
                />
                <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[8px] text-background opacity-0 transition-opacity duration-150 group-hover/cat:opacity-100">
                  {name}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Empty room icon */}
      {room.agentPositions.length === 0 && (
        <div className="mt-auto flex items-center gap-1.5 text-[10px] text-foreground-muted">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
            {room.id === 'archive' ? (
              <><rect x="2" y="3" width="10" height="8" rx="1" /><path d="M5 3V2h4v1M2 6h10" /></>
            ) : (
              <><path d="M7 1v4M3.5 3.5L6 6M10.5 3.5L8 6" /><circle cx="7" cy="9" r="3" /></>
            )}
          </svg>
          {room.id === 'archive' ? '기록 보관소' : '로비'}
        </div>
      )}
    </button>
  )
}

export function OfficeMap({
  projectId,
  agents,
}: {
  projectId: number
  agents: AgentInstance[]
}) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-6">
        <div className="w-full max-w-[540px]">
          <div className="mb-4 text-center">
            <h2 className="text-sm font-semibold text-foreground">01 Log Square</h2>
            <p className="text-[10px] text-foreground-muted">Office Floorplan</p>
          </div>

          <div className="rounded-2xl border border-border bg-background-secondary/50 p-3">
            <div className="mb-2 grid grid-cols-2 gap-2">
              {ROOMS.slice(0, 2).map((room) => (
                <RoomTile
                  key={room.id}
                  room={room}
                  agents={agents}
                  isSelected={selectedRoom?.id === room.id}
                  onClick={() => setSelectedRoom((p) => p?.id === room.id ? null : room)}
                />
              ))}
            </div>

            <div className="mx-auto my-1 flex h-4 w-3/4 items-center justify-center">
              <div className="h-px w-full bg-border" />
              <span className="shrink-0 px-2 text-[9px] text-foreground-muted/50">복도</span>
              <div className="h-px w-full bg-border" />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {ROOMS.slice(2).map((room) => (
                <RoomTile
                  key={room.id}
                  room={room}
                  agents={agents}
                  isSelected={selectedRoom?.id === room.id}
                  onClick={() => setSelectedRoom((p) => p?.id === room.id ? null : room)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedRoom && (
        <RoomDetailPanel
          room={selectedRoom}
          agents={agents}
          projectId={projectId}
          onClose={() => setSelectedRoom(null)}
        />
      )}
    </div>
  )
}
