---
title: War Room Layout
date: 2026-04-06
tags:
  - design
  - ux
  - war-room
  - layout
---

# War Room Layout

> 프로젝트에 들어갔을 때 기본으로 열리는 핵심 회의 화면. 그룹 채팅처럼 보이지만, 실제로는 `결론을 만드는 프로젝트 지휘실`이다.

---

## 화면 목표

- 프로젝트 전체 문맥을 공유한 대화를 시작점으로 둔다.
- 대표가 빠르게 현재 판단 재료를 읽을 수 있어야 한다.
- 에이전트 논의가 액션과 결정으로 이어지게 해야 한다.
- 필요할 때 개별 DM으로 빠르게 분기할 수 있어야 한다.

## 데스크톱 화면 해부

### 1. War Room Header

- 방 이름: `The War Room`
- 참여 에이전트 아바타
- 회의 목적 한 줄
- `Call Specialist`
- `Map`

#### 상태 표시

- `live discussion`
- `awaiting representative`
- `red flag raised`
- `summary ready`

### 2. 대화 타임라인

메시지 유형이 명확히 구분되어야 한다.

- 대표 발언
- 에이전트 발언
- 시스템 메시지
  - `Risk Critic raised a Red Flag`
  - `Verifier marked this as blocked`
  - `COO summarized 3 actions`
  - `CSO proposed 2 paths`

시스템 메시지는 장식이 아니라 실제 운영 이벤트 로그다.

### 3. 입력창

일반 메신저 입력창보다 더 강한 운영 액션을 가져야 한다.

- `Message`
- `@agent`
- `Call Specialist`
- `Promote to Decision`
- `Convert to Action`
- `Create Summary`

### 4. 우측 운영 패널

War Room에서 가장 중요한 영역 중 하나다.

#### Current Decision

- 현재 합의 직전의 핵심 판단
- 승인 전 / 승인됨 / 보류 상태

#### Open Risks

- Risk Critic, CTO가 올린 리스크
- 심각도
- 누가 올렸는지
- 대표 확인 여부

#### Next Actions

- COO가 정리한 액션
- 담당자
- 상태
- due 여부

#### Related Notes

- 회의록
- 프로젝트 개요
- 관련 전략 문서
- 이전 결정 로그

## 행동 흐름

1. 대표가 프로젝트에 들어온다.
2. War Room이 열린다.
3. 우측 패널에서 현재 상태를 빠르게 읽는다.
4. 가운데 대화를 읽고 직접 질문하거나 지시한다.
5. 특정 이슈는 개별 DM으로 내려간다.
6. 결과는 다시 War Room로 돌아와 정리된다.
7. COO가 액션을 낭독하고, 대표가 최종 승인한다.

## 대화 규칙

- 코어 멤버만 기본 발언권을 가진다.
- Specialist는 호출될 때만 전면 등장한다.
- 장문 분석이 길어질 경우 `summary card` 또는 `expand` 구조로 정리한다.
- 최종 결론 없는 회의는 미완료 상태로 표시한다.

## 시각 규칙

- 채팅 본문은 매우 읽기 쉬운 현대적 UI
- 픽셀은 헤더 배지, 방 명패, 참여자 작은 아이콘 정도로 제한
- red flag는 색뿐 아니라 아이콘과 문구로도 보인다
- 승인 대기 상태는 상단 우측에서 강하게 강조

## 모바일 변형

### 상단

- 프로젝트명
- 방 이름
- `Map`
- `Approve` 또는 `Hold`

### 본문

- 대화 타임라인
- 시스템 요약 카드
- sticky decision chip

### 하단

- 메시지 입력
- `Call Agent`
- `Summary`

모바일에서는 오른쪽 패널을 그대로 옮기지 않고, `Decision`, `Risks`, `Actions`를 바텀시트나 segmented view로 분해한다.

## 실패하면 안 되는 것

- 회의가 그냥 단체방처럼 느껴지는 것
- 현재 결론이 어디 있는지 찾기 어려운 것
- red flag가 대화 안에 묻히는 것
- 승인이 채팅 메시지 하나로 흘러가 버리는 것

## Related

- [[Project-Workspace-Layout]] — 상위 shell
- [[The-Boardroom|The War Room]] — 공간 개념
- [[Meeting-Flow]] — 회의 순서

## See Also

- [[Individual-Zones-Layout]] — 개별 논의 공간
- [[Mobile-Companion-Layout]] — 모바일 접근 방식
