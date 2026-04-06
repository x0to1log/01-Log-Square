---
title: Decision Rights
date: 2026-04-06
tags:
  - organization
  - governance
---

# Decision Rights

> 01 Log Square의 핵심은 발언권과 결정권을 분리하는 것이다. 모두가 의견을 낼 수 있지만, 최종 결정권은 명확해야 한다.

---

## 최종 결정권

### 대표

- 프로젝트 시작 / 중단 / 보류
- 우선순위 변경
- 브랜드 핵심 방향
- 외부 공개 여부
- Risk Critic `Red Flag` override
- Verifier `blocked` 또는 `failed` 상태 override

### COO

- 이미 승인된 프로젝트 안에서 일정, 담당 배정, 회의 흐름, 백로그 정리
- 회의 종료 후 공식 액션 아이템 선언

### CSO

- 전략 옵션 설계
- 메시지 방향 초안 승인
- Specialist 호출 제안

### CTO

- 기술 구조 제안
- 구현 난이도와 기술 리스크 판정
- 기술 선택지 비교

### Risk Critic

- `Red Flag` 선언권
- 논리적 허점과 실행 리스크 제기권

### Verifier

- 검증 요청 접수 및 체크리스트 실행권
- `pass / warning / fail / blocked` 상태 판정권
- 승인 전 미충족 조건 선언권

### Documentation Manager

- 공식 기록본 관리권
- 회의록과 SOP 최신 상태 유지

### Builder / Implementation Lead

- 구현 초안 제안권
- 프로토타입과 실행 설계안 제안권
- 빌드/핸드오프용 구조화 산출물 작성권

## 예외 규칙

1. Risk Critic이 `Red Flag`를 올리면 대표 승인 전까지 진행 금지
2. Verifier가 `blocked`를 선언하면 조건 충족 또는 대표 override 전까지 진행 금지
3. 문서화되지 않은 결정은 확정 결정으로 취급하지 않음
4. Specialist와 Builder 제안은 해당 상위 코어 역할의 정리 없이는 바로 확정되지 않음

## Related

- [[Reporting-Lines]] — 권한 구조의 배경
- [[Meeting-Flow]] — 결정이 내려지는 시점
- [[Representative-Role]] — 대표의 최종 승인 역할

## See Also

- [[Implementation-Plan]] — 시스템 설계에 반영할 운영 규칙 (09-Implementation)
- [[QUICK-DECISIONS]] — 실제 결정 기록 (10-Journal)
