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

- **에이전트 선제 대화 (Proactive Messages)** — 에이전트가 대표에게 먼저 대화를 거는 기능. 예: COO가 아침에 마감 임박 액션 알림, Risk Critic이 리스크 감지 시 선제 보고, Trend Scout이 관련 뉴스 브리핑. Vercel Cron 또는 Supabase Edge Function으로 주기적 트리거.
- **에이전트 간 대화 (Inter-Agent Discussion)** — 에이전트들이 서로 의견을 주고받는 기능. 대표가 주제를 던지면 에이전트들이 멀티 라운드로 토론하고, 대표는 지켜보다가 원할 때 끼어드는 구조. Meeting Room API에서 응답 후 추가 라운드를 트리거하는 방식.
- 에이전트 대화 품질 개선 — 실제 대화 예시를 기반으로 페르소나 프롬프트 튜닝 (SOUL.md 패턴)
- 픽셀 플로어맵 네비게이션
- 슬래시 커맨드 확장 (/review, /compare, /vote, /focus, /recall 등)

## Related

- [[Project-Vision]] — 전체 방향
- [[Implementation-Plan]] — 실행 계획
- [[2026-04-06-square-vault-bootstrap|square vault bootstrap]] — 초기 설계 문서

## See Also

- [[Operating-Rhythm]] — 회의와 리뷰 리듬 (05-Operations)
- [[Office-UX-Direction]] — 제품 경험 방향 (08-Design)

