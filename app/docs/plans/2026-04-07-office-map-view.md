# Office Map View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 프로젝트 워크스페이스에 전체 화면 맵 뷰를 추가하여, 대화↔맵 토글 전환으로 오피스 공간을 탐색할 수 있게 한다.

**Architecture:** 기존 `project/[id]/layout.tsx`에 맵/대화 토글 상태를 추가. 맵 뷰는 클라이언트 컴포넌트로 방 카드들을 렌더링하고, 방 클릭 시 데스크탑은 슬라이드 패널, 모바일은 바텀시트로 방 정보를 표시. 추상 플로어플랜이므로 타일/캔버스 없이 CSS 카드로 구현.

**Tech Stack:** Next.js App Router, React state, Tailwind CSS, Supabase (threads/agents 조회는 layout에서 이미 수행 중)

**Design Doc:** `docs/plans/2026-04-07-office-map-view-design.md`

---

### Task 1: 맵/대화 뷰 토글 컨텍스트

**Files:**
- Create: `src/components/ui/view-mode-context.tsx`

**Step 1: 뷰 모드 컨텍스트 생성**

```tsx
// src/components/ui/view-mode-context.tsx
'use client'

import { createContext, useContext, useState } from 'react'

type ViewMode = 'conversation' | 'map'

const ViewModeContext = createContext<{
  mode: ViewMode
  setMode: (mode: ViewMode) => void
  toggle: () => void
}>({
  mode: 'conversation',
  setMode: () => {},
  toggle: () => {},
})

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ViewMode>('conversation')
  const toggle = () => setMode((m) => (m === 'conversation' ? 'map' : 'conversation'))
  return (
    <ViewModeContext.Provider value={{ mode, setMode, toggle }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  return useContext(ViewModeContext)
}
```

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ui/view-mode-context.tsx
git commit -m "feat: add view mode context for map/conversation toggle"
```

---

### Task 2: 맵 토글 버튼

**Files:**
- Create: `src/components/ui/view-mode-toggle.tsx`

**Step 1: 토글 버튼 컴포넌트**

```tsx
// src/components/ui/view-mode-toggle.tsx
'use client'

import { useViewMode } from './view-mode-context'

export function ViewModeToggle() {
  const { mode, toggle } = useViewMode()

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 rounded-md border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {mode === 'conversation' ? (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="1" y="1" width="5" height="5" rx="1" />
            <rect x="8" y="1" width="5" height="5" rx="1" />
            <rect x="1" y="8" width="5" height="5" rx="1" />
            <rect x="8" y="8" width="5" height="5" rx="1" />
          </svg>
          오피스 맵
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 3h12M1 7h8M1 11h10" />
          </svg>
          대화로 돌아가기
        </>
      )}
    </button>
  )
}
```

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/ui/view-mode-toggle.tsx
git commit -m "feat: add view mode toggle button component"
```

---

### Task 3: 방 카드 컴포넌트

**Files:**
- Create: `src/components/map/room-card.tsx`

**Step 1: 방 카드 구현**

방 정의와 테마 색상을 포함한 카드 컴포넌트. 각 방은 테마 색상 10-15% opacity 배경, 이름, 설명, 에이전트 아바타를 표시.

```tsx
// src/components/map/room-card.tsx
'use client'

import type { AgentInstance } from '@/lib/types/database'

export interface RoomDef {
  id: string
  name: string
  description: string
  themeColor: string  // hex
  themeOpacity: number // 0-1
  threadType: 'war_room' | 'direct_message'
  agentKeys?: string[] // agents in this room
}

export const ROOMS: RoomDef[] = [
  {
    id: 'meeting-room',
    name: 'The Meeting Room',
    description: '전체 회의 · Core 멤버 참여',
    themeColor: '#08090E',
    themeOpacity: 0.10,
    threadType: 'war_room',
    agentKeys: ['coo', 'cso', 'cto', 'risk_critic', 'verifier'],
  },
  {
    id: 'individual-zones',
    name: 'The Individual Zones',
    description: '에이전트별 DM',
    themeColor: '#FFF5F7',
    themeOpacity: 0.15,
    threadType: 'direct_message',
    agentKeys: ['documentation_manager', 'builder', 'brand_designer', 'content_creator', 'trend_scout'],
  },
  {
    id: 'archive',
    name: 'The Archive',
    description: '결정, 회의록, SOP 보관',
    themeColor: '#F4F1EA',
    themeOpacity: 0.15,
    threadType: 'war_room',
  },
]

export function RoomCard({
  room,
  agents,
  isActive,
  ceoHere,
  onClick,
}: {
  room: RoomDef
  agents: AgentInstance[]
  isActive: boolean
  ceoHere: boolean
  onClick: () => void
}) {
  const roomAgents = room.agentKeys
    ? agents.filter((a) => room.agentKeys!.includes(a.key))
    : []

  return (
    <button
      onClick={onClick}
      className={`relative w-full cursor-pointer rounded-xl border p-4 text-left transition-all ${
        isActive
          ? 'border-zinc-400 ring-1 ring-zinc-400 dark:border-zinc-500 dark:ring-zinc-500'
          : 'border-zinc-200 hover:border-zinc-300 dark:border-zinc-800 dark:hover:border-zinc-700'
      }`}
      style={{
        backgroundColor: `${room.themeColor}${Math.round(room.themeOpacity * 255).toString(16).padStart(2, '0')}`,
      }}
    >
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{room.name}</h3>
      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{room.description}</p>

      {/* Agent avatars */}
      {roomAgents.length > 0 && (
        <div className="mt-3 flex -space-x-1">
          {ceoHere && (
            <img
              src="/sprites/characters/ceo/south.png"
              alt="대표"
              className="h-6 w-6 rounded-full border-2 border-white object-contain dark:border-zinc-900"
              style={{ imageRendering: 'pixelated' }}
            />
          )}
          {roomAgents.slice(0, 5).map((agent) => (
            <img
              key={agent.id}
              src={`/sprites/characters/${agent.key}/south.png`}
              alt={agent.name}
              className="h-6 w-6 rounded-full border-2 border-white object-contain dark:border-zinc-900"
              style={{ imageRendering: 'pixelated' }}
            />
          ))}
          {roomAgents.length > 5 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-xs dark:border-zinc-900 dark:bg-zinc-700">
              +{roomAgents.length - 5}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
```

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/map/room-card.tsx
git commit -m "feat: add room card component for office map"
```

---

### Task 4: 방 정보 슬라이드 패널

**Files:**
- Create: `src/components/map/room-detail-panel.tsx`

**Step 1: 슬라이드 패널 구현**

데스크탑에서는 오른쪽 슬라이드 패널, 모바일에서는 바텀시트. 방 정보, 에이전트 목록, "들어가기" 버튼.

```tsx
// src/components/map/room-detail-panel.tsx
'use client'

import Link from 'next/link'
import type { RoomDef } from './room-card'
import type { AgentInstance } from '@/lib/types/database'
import { useViewMode } from '@/components/ui/view-mode-context'

export function RoomDetailPanel({
  room,
  agents,
  projectId,
  onClose,
}: {
  room: RoomDef | null
  agents: AgentInstance[]
  projectId: number
  onClose: () => void
}) {
  const { setMode } = useViewMode()

  if (!room) return null

  const roomAgents = room.agentKeys
    ? agents.filter((a) => room.agentKeys!.includes(a.key))
    : []

  const href = room.id === 'meeting-room'
    ? `/project/${projectId}`
    : room.id === 'archive'
      ? `/project/${projectId}`
      : undefined

  return (
    <>
      {/* Desktop: right slide panel */}
      <div className="hidden w-[340px] shrink-0 flex-col border-l border-zinc-200 lg:flex dark:border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <h3 className="text-sm font-semibold">{room.name}</h3>
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            닫기
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="mb-4 text-xs text-zinc-500">{room.description}</p>

          {roomAgents.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">참여 에이전트</p>
              <div className="flex flex-col gap-2">
                {roomAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-2">
                    <img
                      src={`/sprites/characters/${agent.key}/south.png`}
                      alt={agent.name}
                      className="h-8 w-8 rounded-lg object-contain"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <div>
                      <p className="text-sm font-medium">{agent.name}</p>
                      <p className="text-xs text-zinc-400">{agent.role_title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {href && (
            <Link
              href={href}
              onClick={() => setMode('conversation')}
              className="block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              들어가기
            </Link>
          )}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-zinc-200 bg-white p-4 shadow-lg lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{room.name}</h3>
          <button onClick={onClose} className="text-xs text-zinc-400">닫기</button>
        </div>
        <p className="mt-1 text-xs text-zinc-500">{room.description}</p>

        {roomAgents.length > 0 && (
          <div className="mt-3 flex -space-x-1">
            {roomAgents.map((agent) => (
              <img
                key={agent.id}
                src={`/sprites/characters/${agent.key}/south.png`}
                alt={agent.name}
                className="h-8 w-8 rounded-full border-2 border-white object-contain dark:border-zinc-900"
                style={{ imageRendering: 'pixelated' }}
              />
            ))}
          </div>
        )}

        {href && (
          <Link
            href={href}
            onClick={() => setMode('conversation')}
            className="mt-4 block w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            들어가기
          </Link>
        )}
      </div>
    </>
  )
}
```

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/map/room-detail-panel.tsx
git commit -m "feat: add room detail slide panel with responsive layout"
```

---

### Task 5: 오피스 맵 메인 컴포넌트

**Files:**
- Create: `src/components/map/office-map.tsx`

**Step 1: 맵 메인 컴포넌트**

방 카드들을 그리드로 배치하고, 클릭 시 디테일 패널을 여는 오케스트레이터.

```tsx
// src/components/map/office-map.tsx
'use client'

import { useState } from 'react'
import type { AgentInstance } from '@/lib/types/database'
import { RoomCard, ROOMS } from './room-card'
import type { RoomDef } from './room-card'
import { RoomDetailPanel } from './room-detail-panel'

export function OfficeMap({
  projectId,
  agents,
}: {
  projectId: number
  agents: AgentInstance[]
}) {
  const [selectedRoom, setSelectedRoom] = useState<RoomDef | null>(null)

  return (
    <div className="flex min-h-0 flex-1">
      {/* Map area */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6">
        {/* CEO avatar */}
        <div className="mb-6 flex flex-col items-center gap-2">
          <img
            src="/sprites/characters/ceo/south.png"
            alt="대표"
            className="h-16 w-16 object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-xs font-medium text-zinc-500">대표</span>
        </div>

        {/* Room grid */}
        <div className="grid w-full max-w-[600px] grid-cols-1 gap-3 sm:grid-cols-2">
          {ROOMS.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              agents={agents}
              isActive={selectedRoom?.id === room.id}
              ceoHere={room.id === 'meeting-room'}
              onClick={() =>
                setSelectedRoom((prev) => (prev?.id === room.id ? null : room))
              }
            />
          ))}
        </div>
      </div>

      {/* Detail panel */}
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
```

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/map/office-map.tsx
git commit -m "feat: add office map main component with room grid"
```

---

### Task 6: 레이아웃에 맵/대화 전환 통합

**Files:**
- Modify: `src/app/project/[id]/layout.tsx`
- Modify: `src/components/ui/global-bar.tsx`

**Step 1: layout.tsx에 ViewModeProvider + 조건부 렌더링 추가**

`ViewModeProvider`로 감싸고, `mode === 'map'`이면 사이드바/대화/운영패널 대신 `OfficeMap`을 렌더링.

layout.tsx 변경 사항:
- import ViewModeProvider, ViewModeToggle
- PanelProvider와 함께 ViewModeProvider로 감싸기
- GlobalBar에 ViewModeToggle 추가를 위해 children slot 또는 추가 prop
- 메인 영역을 클라이언트 컴포넌트로 분리해서 mode에 따라 분기

새로운 클라이언트 래퍼 필요:

```tsx
// src/components/ui/project-workspace.tsx
'use client'

import { useViewMode } from './view-mode-context'
import { OfficeMap } from '@/components/map/office-map'
import type { AgentInstance } from '@/lib/types/database'

export function ProjectWorkspace({
  children,
  sidebarContent,
  operationsContent,
  projectId,
  agents,
}: {
  children: React.ReactNode
  sidebarContent: React.ReactNode
  operationsContent: React.ReactNode
  projectId: number
  agents: AgentInstance[]
}) {
  const { mode } = useViewMode()

  if (mode === 'map') {
    return (
      <div className="flex flex-1 overflow-hidden">
        <OfficeMap projectId={projectId} agents={agents} />
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden w-[300px] shrink-0 overflow-y-auto border-r border-zinc-200 lg:block dark:border-zinc-800">
        {sidebarContent}
      </aside>
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
```

**Step 2: layout.tsx 수정**

- 기존 3컬럼 div를 `ProjectWorkspace`로 교체
- `ViewModeProvider`를 `PanelProvider`와 함께 감싸기
- GlobalBar에 `ViewModeToggle`을 action slot으로 전달

**Step 3: GlobalBar에 토글 버튼 영역 추가**

GlobalBar에 `actions` prop을 추가해서 오른쪽에 토글 버튼을 렌더링할 수 있게.

**Step 4: 타입 체크**

Run: `npx tsc --noEmit`

**Step 5: Commit**

```bash
git add src/components/ui/project-workspace.tsx src/app/project/[id]/layout.tsx src/components/ui/global-bar.tsx
git commit -m "feat: integrate map/conversation toggle into project layout"
```

---

### Task 7: 모바일 헤더에 맵 토글 추가

**Files:**
- Modify: `src/components/ui/mobile-header.tsx`

**Step 1: 모바일 헤더에 맵 아이콘 추가**

타이틀 옆에 맵 토글 아이콘을 추가해서 모바일에서도 맵 뷰로 전환 가능하게.

**Step 2: 타입 체크**

Run: `npx tsc --noEmit`

**Step 3: Commit**

```bash
git add src/components/ui/mobile-header.tsx
git commit -m "feat: add map toggle to mobile header"
```

---

### Task 8: 최종 확인 및 정리

**Step 1: 전체 빌드**

Run: `npm run build`
Expected: Build succeeds

**Step 2: dev 서버에서 수동 테스트**

Run: `npm run dev`
확인 사항:
- [ ] 데스크탑: GlobalBar에 "오피스 맵" 토글 버튼 보임
- [ ] 클릭하면 3컬럼 대화 → 맵 뷰 전환
- [ ] 방 카드 클릭 → 오른쪽 슬라이드 패널 열림
- [ ] "들어가기" → 대화 뷰로 전환
- [ ] 모바일: 맵 아이콘으로 전환 가능
- [ ] 방 카드 탭 → 바텀시트

**Step 3: Commit**

```bash
git commit -m "feat: complete office map view with responsive layout"
```
