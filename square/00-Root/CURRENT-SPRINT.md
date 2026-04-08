---
title: Current Sprint
date: 2026-04-06
tags:
  - root
  - sprint
  - active
---

# Current Sprint

> 현재 목표: `square` Obsidian 공간을 부트스트랩하고, 01 Log Square의 조직 운영 언어를 고정한다.

---

## Sprint Focus

1. `square`의 기본 정보 구조 확정
2. 대표/에이전트 조직의 구조와 결정 규칙 문서화
3. 가상 오피스 공간 개념을 제품 UX 언어로 변환
4. 다음 단계 구현 문서를 위한 기술 베이스 정리

## Current Deliverables

- [[00-INDEX]] — 대시보드 진입점
- [[Agent-Team]] — 역할 정의
- [[Reporting-Lines]] — 보고 체계
- [[Decision-Rights]] — 권한 구조
- [[Space-Map]] — 오피스 공간 설계
- [[Implementation-Plan]] — 실행 기준선

## Risks

- 오피스 콘셉트가 너무 장식적이면 실제 업무 흐름이 약해질 수 있다.
- 모든 직원이 동시에 말하는 구조는 제품 경험을 산만하게 만들 수 있다.
- 기록 체계가 없으면 에이전트 조직의 일관성이 빠르게 무너진다.

## Next Up

- 프로젝트별 방 템플릿 정의
- 대표 승인 플로우를 UI에 반영하는 설계 시작

## Backlog

- **에이전트 자동 작업 (Proactive Agent Tasks)** — 시간 기반(Cron) + 이벤트 기반(DB 트리거) 하이브리드. 결과는 Meeting Room에 메시지로 전달.
  - 시간 기반: COO 일일 브리핑, CSO 주간 전략 리뷰, Trend Scout 뉴스 브리핑
  - 이벤트 기반: 새 결정 등록 시 Risk Critic 자동 리스크 체크, 액션 마감 3일 전 COO 리마인드, 프로젝트 생성 시 COO 90일 로드맵 초안
- **읽지 않은 메시지 표시 (Unread Badge)** — 에이전트가 보낸 메시지가 있으면 사이드바/로비에 배지 표시. 대표가 확인 안 한 메시지가 있다는 걸 알 수 있게.
- ~~에이전트 간 대화 (Inter-Agent Discussion)~~ — ✅ 구현 완료 (2-3라운드 자동 토론)
- 에이전트 대화 품질 개선 — 실제 대화 예시를 기반으로 페르소나 프롬프트 튜닝 (SOUL.md 패턴)
- 픽셀 플로어맵 네비게이션
- 슬래시 커맨드 확장 (/review, /compare, /vote, /focus, /recall 등)
- 외부 알림 채널 연동 (텔레그램/슬랙) — 접속 안 해도 알림 수신

## Related

- [[Project-Vision]] — 전체 방향
- [[Implementation-Plan]] — 실행 계획
- [[2026-04-06-square-vault-bootstrap|square vault bootstrap]] — 초기 설계 문서

## See Also

- [[Operating-Rhythm]] — 회의와 리뷰 리듬 (05-Operations)
- [[Office-UX-Direction]] — 제품 경험 방향 (08-Design)

