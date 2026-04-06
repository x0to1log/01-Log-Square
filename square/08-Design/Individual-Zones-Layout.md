---
title: Individual Zones Layout
date: 2026-04-06
tags:
  - design
  - ux
  - individual-zones
  - layout
---

# Individual Zones Layout

> 에이전트별 개인 업무실에 대응하는 1:1 대화 화면. 깊이 있는 검토를 위한 공간이지만, 프로젝트 맥락과 분리되지 않아야 한다.

---

## 화면 목표

- 특정 에이전트의 관점으로 더 깊게 파고들게 한다.
- Meeting Room보다 더 긴 분석과 초안을 허용한다.
- 하지만 최종 합의는 언제나 Meeting Room로 되돌아가게 만든다.

## 기본 규칙

- 모든 DM은 특정 프로젝트 안에 속한다.
- 프로젝트 밖의 글로벌 DM은 만들지 않는다.
- DM 결과는 `Meeting Room로 보내기`가 쉬워야 한다.
- 에이전트별 개성은 정보 구조보다 뒤에 온다.

## 데스크톱 화면 해부

### 1. 상단 바

- 프로젝트명
- 방 이름
예: `COO Office`, `CTO Office`
- 에이전트 역할 배지
- `Back to Meeting Room`
- `Map`

`Back to Meeting Room`은 항상 1차 액션으로 보여야 한다.

### 2. 왼쪽 패널

Meeting Room과 같은 스레드 목록을 유지한다.

이유:
- 학습 비용이 낮다
- 프로젝트 중심 구조가 유지된다
- DM과 회의방이 같은 시스템 안에 있음을 느끼게 한다

### 3. 메인 대화 영역

DM은 일반 메신저처럼 편해야 하지만, 업무 툴이기도 하다.

#### 허용해야 하는 대화

- 초안 요청
- 특정 관점 질문
- 피드백 요청
- 정리 부탁
- 관련 문서 인용

#### 빠른 액션

- `Send to Meeting Room`
- `Promote to Decision`
- `Convert to Action`
- `Ask for Summary`
- `Pin Draft`

### 4. 우측 패널

Meeting Room보다 더 `에이전트 특화`되어야 한다.

#### 공통 패널 블록

- `Agent Lens`
지금 이 에이전트가 보는 핵심 관점

- `Draft Output`
현재 작성 중이거나 최근 생성한 초안

- `Suggested Actions`
이 에이전트가 권하는 다음 단계

- `Promote to Meeting Room`
합의 테이블로 보낼 후보

## 역할별 차이

### COO Office

- 우선순위 목록
- 일정/마감
- 액션 정리
- blockers

### CSO Office

- 전략 옵션 카드
- framing 문장
- 포지셔닝 초안
- 브레인스토밍 묶음

### CTO Office

- feasibility notes
- 기술 제약
- 구조 선택지
- 예상 구현 난도

### Risk Critic Office

- 리스크 목록
- 반례와 반대 논리
- 숨은 가정
- `red flag` 카드

### Verifier Office

- 검증 체크리스트
- 조건 충족 여부
- 사실 확인 메모
- `blocked` 또는 `pass` 상태 카드

### Specialist Offices

- 산출물 초안
- 참고 레퍼런스
- 전달용 표현
- 브랜드 또는 콘텐츠 결과물

## 시각 규칙

- 대화 영역은 읽기 쉬운 현대적 메신저 UI
- 각 방 헤더에는 작은 픽셀 오브젝트와 명패를 둔다
- 귀여움은 작은 소품과 상태 변화에서 만든다
- 방마다 컬러 포인트는 달라도 컴포넌트 구조는 바꾸지 않는다

## 모바일 변형

- 일반 DM처럼 단일 컬럼
- 상단에 에이전트 이름, 역할, `Meeting Room로 보내기`
- 구조화 정보는 액션 시트로 노출
- 긴 초안은 `expand` 또는 note preview로 읽게 한다

## 실패하면 안 되는 것

- DM이 프로젝트 밖의 사적인 채팅처럼 느껴지는 것
- 결과를 Meeting Room로 되돌리기 어려운 것
- 에이전트마다 화면 구조가 너무 달라지는 것
- 장식이 많아지고 실무성이 약해지는 것

## Related

- [[Project-Workspace-Layout]] — 공통 shell
- [[The-Individual-Zones]] — 공간 개념
- [[Meeting-Room-Layout]] — 합의 공간

## See Also

- [[Pixel-Accent-System]] — 픽셀 요소 설계
- [[Agent-Team]] — 에이전트 역할 정의 (02-Organization)

