---
title: Project Workspace Layout
date: 2026-04-06
tags:
  - design
  - ux
  - workspace
  - layout
---

# Project Workspace Layout

> 01 Log Square의 핵심 화면 shell. 프로젝트에 들어왔을 때 사용자가 마주하는 기본 작업 환경을 정의한다.

---

## 목적

프로젝트 워크스페이스는 `메신저처럼 빠르게 대화하면서도, 프로젝트 운영 정보가 항상 구조화되어 보이는 화면`이어야 한다.

이 화면은 다음 조건을 동시에 만족해야 한다.

- 프로젝트 단위로 모든 맥락이 묶인다.
- 기본 진입은 [[The-Meeting-Room|The Meeting Room]]이다.
- 각 에이전트 DM으로 빠르게 이동할 수 있다.
- 대화와 별개로 `결정 / 리스크 / 다음 액션 / 관련 문서`가 항상 보인다.
- `Map` 전용 보기로 floorplan 감각을 언제든 불러올 수 있다.

## 핵심 개념

- `프로젝트`가 최상위 컨테이너다.
- `스레드`는 프로젝트 안에 속한다.
- `Meeting Room`은 기본 앵커 스레드다.
- `Individual Zones`는 프로젝트 내부의 1:1 DM 스레드다.
- 오른쪽 패널은 채팅 요약이 아니라 `구조화된 운영 상태`다.

## 데스크톱 레이아웃

### 상단 글로벌 바

- 좌측: 프로젝트 이름, 상태 배지, 현재 phase
- 중앙: 현재 열려 있는 방 이름
- 우측: `Map`, `Search`, `Pending Approvals`, 대표 메뉴

### 3열 본문 구조

1. `왼쪽 패널`
스레드 탐색과 프로젝트 전환

2. `가운데 패널`
현재 대화와 입력창

3. `오른쪽 패널`
운영 상태, 결정, 리스크, 액션, 관련 문서

### 권장 비율

- 왼쪽 280~320px
- 가운데 1fr
- 오른쪽 320~360px

가운데 대화창은 너무 넓지 않게 유지해야 한다. 장문 대화가 많은 만큼 읽기 폭이 무너지지 않게 760~880px 수준을 넘기지 않는 편이 좋다.

## 왼쪽 패널 상세

### 목적

- 현재 프로젝트 안의 모든 대화 채널을 빠르게 오간다.
- Meeting Room이 항상 최상단 앵커로 보인다.
- 읽지 않은 메시지, red flag, summary ready 같은 상태를 즉시 읽는다.

### 구성

- 프로젝트 전환 드롭다운
- 스레드 검색
- 필터 칩
  - `All`
  - `Core`
  - `Specialist`
  - `Needs attention`
- 스레드 섹션
  - `Meeting Room`
  - `Core Agents`
  - `Specialists`
  - `Recent Notes`

### 스레드 셀 정보

- 에이전트 이름 또는 방 이름
- 작은 1타일 픽셀 아이콘
- 상태 배지
  - unread
  - awaiting reply
  - red flag
  - summary ready
- 최근 한 줄 미리보기

## 가운데 패널 상세

### 목적

- 현재 스레드의 대화를 읽고, 대표가 직접 개입한다.
- 일반 메신저처럼 자연스럽게 사용되지만, 운영 명령도 함께 쓴다.

### 구조

- 스레드 헤더
- 메시지 타임라인
- 시스템 이벤트 라인
- 메시지 입력부

### 입력부 액션

- 일반 메시지 전송
- `@agent` 호출
- `Promote to Decision`
- `Convert to Action`
- `Pin to Brief`
- `Send to Meeting Room`

## 오른쪽 패널 상세

### 목적

- 채팅으로부터 독립된 `현재 프로젝트 상태`를 보여준다.
- 대표가 빠르게 읽고 결정할 수 있게 한다.

### 기본 스택

1. `Current Decision`
2. `Open Risks`
3. `Next Actions`
4. `Related Notes`

### 카드 원칙

- 각 카드에는 길고 복잡한 본문보다 핵심 문장 1~3개만 먼저 보여준다.
- `expand` 또는 `open note`로 깊이를 연다.
- 리스크는 우선순위와 출처 에이전트를 함께 보여준다.
- 액션은 담당자, 상태, due 여부를 보여준다.

## Map 전용 보기

### 왜 별도 보기인가

- 기본 화면은 생산성을 우선해야 한다.
- floorplan은 공간 감각과 탐색을 위한 레이어로 두는 편이 모바일 확장에 유리하다.
- 맵을 항상 노출하면 텍스트와 패널 사용성이 떨어진다.

### 열리는 방식

- 데스크톱: 전체 오버레이 또는 별도 전환 화면
- 모바일: 풀스크린 시트

### 맵에서 보이는 요소

- 대표 캐릭터
- Meeting Room
- Individual Zones
- Archive
- Radar
- 01-Mobile 연결 노드
- 상태 표시 오브젝트

## 모바일 공통 원칙

- 기본은 `대화 중심 단일 컬럼`
- 오른쪽 패널 정보는 바텀시트나 세그먼트 탭으로 분해
- `Map`은 상단 버튼으로 언제든 호출 가능
- 방 전환은 좌우 스와이프보다 명시적 탭이 낫다

## 상태

### Empty

- 프로젝트는 생성됐지만 대화가 없는 상태
- Meeting Room에 첫 질문을 던지는 CTA 필요

### Active

- Meeting Room 논의 중
- 열린 리스크와 액션이 보임

### Escalated

- Risk Critic red flag, Verifier blocked 상태, 또는 대표 승인 대기
- 상단에 강조 배지 필요

### Archived

- 읽기 전용 모드
- 대화보다 기록과 결과가 앞에 보임

## 안티패턴

- DM과 Meeting Room이 완전히 분리되어 다시 연결되지 않는 구조
- 오른쪽 패널이 접히거나 숨겨져 중요도가 사라지는 구조
- 맵이 늘 떠 있어서 실제 대화 공간을 압박하는 구조
- 스레드 목록에 상태 정보가 없어 모든 방이 평평하게 보이는 구조

## Related

- [[Hybrid-Floorplan-Workspace]] — 상위 방향
- [[Meeting-Room-Layout]] — 기본 진입 화면 상세
- [[Individual-Zones-Layout]] — DM 화면 상세

## See Also

- [[Mobile-Companion-Layout]] — 모바일 구조
- [[Pixel-Accent-System]] — 픽셀 사용 규칙

