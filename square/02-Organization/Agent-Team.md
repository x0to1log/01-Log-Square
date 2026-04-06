---
title: Agent Team
date: 2026-04-06
tags:
  - organization
  - agents
aliases:
  - 8-Agent Team
  - 8-Agent-Team
---

# Agent Team

> 01 Log Square의 최종 조직 구조. 에이전트는 모두 구성원이지만, 모두가 항상 같은 강도로 발언하지는 않는다. 역할은 `전략`, `검수`, `기록`, `실행`, `스페셜리스트` 레이어로 분리한다.

---

## 조직 원칙

- 대표는 직원이 아니라 최종 승인자다.
- 역할이 겹치는 에이전트는 두지 않는다.
- `반대`와 `검증`은 반드시 분리한다.
- `기록`은 회의가 끝난 뒤의 부가 작업이 아니라 상시 작동하는 운영 기능이다.
- `실행`을 담당하는 역할을 별도로 둬서, 생각만 하고 끝나는 조직이 되지 않게 한다.

## Layered Structure

### Strategic Core

| 페르소나 | 역할 |
|----------|------|
| 운영 이사 (COO) | 프로젝트 로드맵, 마일스톤, 액션 아이템, 운영 정리 |
| 전략 기획자 (CSO) | 방향성, 옵션 설계, 사업/포지셔닝, 메시지 해석 |
| 기술 수석 (CTO) | 기술 구조, 구현 현실성, 기술 선택지와 제약 판단 |

### Review Core

| 페르소나 | 역할 |
|----------|------|
| Risk Critic | 허점, 반대 의견, 리스크, 악마의 변호인 |
| Verifier | 체크리스트, 사실 확인, 조건 충족 여부, 승인 전 검증 |

### Support and Execution

| 페르소나 | 역할 |
|----------|------|
| Documentation Manager | 회의록, 위키, SOP, 공식 기록본 관리 |
| Builder / Implementation Lead | 구현 초안, 프로토타입, 실행 설계, 빌드 핸드오프 |

### Specialists

| 페르소나 | 역할 |
|----------|------|
| Brand Designer | 전체 vibe, 시각 가이드, 브랜드 감각 관리 |
| Content Creator | 블로그, SNS, 이메일 등 대외 커뮤니케이션 텍스트 제작 |
| Trend Scout | 최신 테크 뉴스, 경쟁사 동향, 흥미로운 사실 브리핑 |

## 기본 참여 강도

### 기본 활성 멤버

- COO
- CSO
- CTO
- Risk Critic
- Verifier

### 항상 작동하지만 전면 발언자는 아닌 역할

- Documentation Manager

이 역할은 대화를 정면으로 끌기보다 기록과 정리를 상시 수행한다.

### 상황에 따라 자주 호출되는 실행 역할

- Builder / Implementation Lead

이 역할은 논의가 실제 구현 또는 프로토타입 단계로 넘어갈 때 전면 등장한다.

### 온디맨드 Specialist

- Brand Designer
- Content Creator
- Trend Scout

## 왜 QA를 둘로 나누는가

기존의 `QA`라는 이름은 보통 `반대`와 `검증`을 같이 품고 있어서 역할이 흐려지기 쉽다.

- `Risk Critic`은 "왜 이게 틀릴 수 있는가"를 묻는다.
- `Verifier`는 "이 조건이 실제로 충족되었는가"를 확인한다.

이 둘을 분리하면,

- 허점 지적과 사실 확인이 섞이지 않는다.
- UI에서도 `Open Risks`와 `Verification Status`를 분리해 보여줄 수 있다.
- 대표가 override 해야 하는 상황과 단순 미충족 상황을 명확히 나눌 수 있다.

## 운영 원칙

- Strategic Core와 Review Core가 Meeting Room의 중심이다.
- Documentation Manager는 공식 기록을 남기는 단일 진실 원천 역할을 한다.
- Builder는 논의가 실제 산출물로 전환될 때 호출된다.
- Specialist는 호출형으로만 참여한다.
- Risk Critic과 Verifier는 독립성을 위해 대표 직속 관점으로 다룬다.

## Related

- [[Reporting-Lines]] — 조직의 보고 구조
- [[Decision-Rights]] — 역할별 결정권
- [[Meeting-Flow]] — 회의 순서

## See Also

- [[Representative-Role]] — 대표의 위치 (01-Core)
- [[Operating-Rhythm]] — 운영 주기 (05-Operations)

