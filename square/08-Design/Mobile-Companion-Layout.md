---
title: Mobile Companion Layout
date: 2026-04-06
tags:
  - design
  - ux
  - mobile
  - layout
---

# Mobile Companion Layout

> `01-Mobile`의 실제 화면 설계. 웹 오피스의 복제본이 아니라, 대표가 오피스 밖에서도 빠르게 읽고 개입할 수 있는 컴패니언 경험을 정의한다.

---

## 모바일의 역할

- 읽기
- 짧은 응답
- 승인 / 보류
- 긴급 호출
- 빠른 메모

모바일은 `깊은 운영`보다 `빠른 개입`에 최적화되어야 한다.

## 전반 구조

### 권장 탭

1. `Inbox`
2. `Projects`
3. `Chats`
4. `You`

## 탭별 목적

### Inbox

- 대기 승인
- Risk Critic red flag
- Verifier blocked check
- COO summary ready
- Specialist request

대표가 가장 먼저 봐야 할 항목이 들어온다.

### Projects

- 프로젝트 목록
- 상태
- 열린 액션 수
- 최근 활동

프로젝트를 누르면 기본으로 Meeting Room 모바일 뷰가 열린다.

### Chats

- Meeting Room
- 에이전트 DM
- unread, flagged, awaiting decision 상태

### You

- 대표 메모
- quick notes
- 나중에 자신에게 보내는 운영 메모

## 프로젝트 진입 후

### 기본 화면: Meeting Room Mobile

#### 상단

- 뒤로가기
- 프로젝트명
- 방 이름
- `Map`

#### 본문

- 메시지 타임라인
- 요약 카드
- sticky decision chip

#### 하단

- 메시지 입력
- `Approve`
- `Hold`
- `Call Agent`

## DM 모바일 화면

### 상단

- 에이전트 이름
- 역할
- `Send to Meeting Room`

### 본문

- 대화
- 짧은 초안 미리보기

### 하단

- 입력
- `Summary`
- `Action`

## 모바일 Map

### 열리는 방식

- 풀스크린 오버레이
- 프로젝트별 오피스 맵
- 대표 캐릭터와 활성 방 표시

### 목적

- 빠른 방 이동
- 현재 상태 감각 제공
- 귀여운 공간 네비게이션

### 맵에서 보이는 상태

- unread
- red flag
- summary ready
- approval waiting

## 시각 전략

- 모바일 본문은 현대적 UI
- 픽셀은 썸네일, 맵, 배지, 작은 상태 오브젝트 중심
- 과한 게임성보다 `포켓 인터컴` 감각을 유지
- 승인 시 작은 스탬프 애니메이션 정도는 허용

## 우선순위

### Must Have

- 빠른 읽기
- 승인이 명확한 UI
- Meeting Room 진입
- DM 응답
- Map 호출

### Nice to Have

- 음성 메모
- 위젯
- 에이전트 상태 미니맵

### Not for v1

- 긴 문서 편집
- 복잡한 대시보드
- 세밀한 프로젝트 설정 편집

## 실패하면 안 되는 것

- 모바일에서 웹과 같은 밀도의 정보량을 강요하는 것
- Map이 무거워서 자주 못 여는 것
- 승인/보류가 너무 깊은 플로우에 숨어 있는 것
- 모바일에서 프로젝트 맥락이 끊기는 것

## Related

- [[01-Mobile]] — 공간 개념
- [[Project-Workspace-Layout]] — 웹과의 관계
- [[Meeting-Room-Layout]] — 기본 진입 화면

## See Also

- [[Pixel-Accent-System]] — 모바일 픽셀 사용 기준
- [[Representative-Role]] — 대표 중심 사용 원칙 (01-Core)

