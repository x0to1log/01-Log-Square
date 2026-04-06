---
title: Implementation Plan
date: 2026-04-06
updated: 2026-04-06
tags:
  - implementation
  - planning
---

# Implementation Plan

> 문서 공간에서 시작하되, 이 구조가 나중에 제품 기능으로 자연스럽게 이어지게 설계한다.

---

## 지금 확정된 것

- `square`는 01 Log Square의 단일 운영 공간이다.
- 대표는 최종 승인자이며 직원이 아니다.
- 에이전트 조직은 `Strategic Core + Review Core + Support/Execution + Specialists` 구조로 운영한다.
- 조직 구조, 보고 체계, 결정권은 문서화된 상태를 우선한다.
- 기본 진입점은 프로젝트 목록이다.
- 프로젝트를 열면 `하이브리드 플로어플랜 워크스페이스`가 열리고, 기본 스레드는 Meeting Room이다.
- 개별 에이전트와의 DM은 같은 프로젝트 맥락 안에서 지원한다.
- 픽셀은 탑다운 캐릭터와 조형물 중심의 시각 악센트로만 사용한다.
- 데이터베이스는 Supabase를 사용한다.
- v1은 웹 우선으로 만들고, 모바일은 반응형/컴패니언 경험으로 먼저 지원한다.
- 에이전트 오케스트레이션은 Mastra (TypeScript)를 사용하며, Next.js API Routes 안에서 실행한다.
- Supabase는 제품의 유일한 진실 원천이다. Mastra는 에이전트 런타임일 뿐, 제품 상태를 소유하지 않는다.
- Mastra의 메모리도 Supabase Postgres에 저장하여 진실 원천을 단일화한다.
- Mastra에 종속되지 않는 설계를 유지한다. 페르소나 원본은 Supabase에, 구조화 결과도 Supabase에 저장한다.
- OpenClaw는 검토 결과 v1에서 제외한다. (구조화 출력 미지원, 세션 격리, 인프라 과다)

## 다음 구현 트랙

1. v1 핵심 DB 엔터티와 테이블 구조 정의 (00008 마이그레이션 포함)
2. Meeting Room / DM을 함께 다루는 thread 모델 설계
3. Mastra 에이전트 정의 및 Supervisor 패턴 설계 (Meeting Room 멀티에이전트)
4. 구조화 출력 스키마 정의 (Zod → decisions, actions, reviews)
5. 대표 승인 UI/상태 모델 정의
6. 픽셀 오피스 자산 프로토타입 정의
7. 반응형 웹에서의 모바일 companion 범위 확정

## 문서 운영 원칙

- 구현 전에 관련 핵심 노트를 먼저 갱신한다.
- 설계 문서는 `plans/` 아래에 날짜 기반으로 작성한다.
- 빠른 의사결정은 [[QUICK-DECISIONS]]에 먼저 남기고, 이후 핵심 문서에 반영한다.

## Related

- [[Tech-Stack]] — 기술 베이스
- [[Roadmap]] — 상위 단계 계획
- [[2026-04-06-square-vault-bootstrap|square vault bootstrap]] — 초기 정리 문서
- [[Hybrid-Floorplan-Workspace]] — 승인된 UX 방향
- [[Project-Workspace-Layout]] — 구현 대상 화면 구조

## See Also

- [[Decision-Rights]] — 제품에 반영해야 할 권한 규칙 (02-Organization)
- [[Office-UX-Direction]] — 제품 경험 방향 (08-Design)

