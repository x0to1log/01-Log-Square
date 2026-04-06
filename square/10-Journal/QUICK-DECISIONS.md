---
title: Quick Decisions
date: 2026-04-06
tags:
  - journal
  - decisions
---

# QUICK DECISIONS

## 2026-04-06

- 대표의 공식 역할을 `대표`로 확정했다.
- 조직 구조는 `4 core + 4 specialist` 모델로 시작한다.
- QA는 독립성을 위해 대표 직속 관점으로 둔다.
- `square`를 01 Log Square의 Obsidian 운영 공간 이름으로 확정했다.
- 01 Log Square는 외부 공유용 서비스 문서보다 `대표 개인을 위한 운영 환경`으로 먼저 정의한다.
- 슬로건은 `From 0 to 1, Every Log Matters.`를 사용한다.
- 기본 진입점은 프로젝트 목록으로 둔다.
- 프로젝트를 열면 기본으로 `The War Room`이 열린다.
- 각 에이전트와의 개별 대화는 프로젝트 내부 DM 형태로 지원한다.
- UI는 `하이브리드 플로어플랜 워크스페이스`로 간다.
- 픽셀은 탑다운 1타일 캐릭터와 작은 조형물 중심의 악센트로 사용한다.
- 대표 캐릭터는 오피스 맵 안에 직접 보이게 한다.
- 플로어플랜은 상시 노출이 아니라 `Map` 전용 보기 전환으로 연다.
- 모바일은 웹의 복제판이 아니라 대표용 `빠른 확인 / 승인 / 짧은 응답` 채널로 정의한다.
- 데이터베이스는 Supabase를 사용한다.
- v1은 네이티브 앱보다 웹 우선 + 반응형 모바일로 간다.
- ~~에이전트/LLM 서버는 Python + FastAPI를 기본으로 한다.~~ → 아래 수정 참조
- ~~OpenClaw는 지금 당장 코어 앱 종속성으로 넣지 않고, 후속 agent runtime 연동 대상으로 둔다.~~ → 아래 수정 참조
- 초기 `4 core + 4 specialist` 가설을 발전시켜, 최종 조직은 `Strategic Core + Review Core + Support/Execution + Specialists` 레이어로 정리한다.
- `QA` 역할은 `Risk Critic`과 `Verifier`로 분리한다.
- `Builder / Implementation Lead`를 추가해 실행 담당 역할을 보강한다.

### 스택 수정 (같은 날)

- Python + FastAPI를 제거하고, 에이전트 오케스트레이션은 Mastra (TypeScript)로 대체한다.
- Mastra는 Next.js API Routes 안에서 실행한다. 별도 서버 프로세스 없음.
- 전체 스택을 TypeScript 단일 스택으로 통일한다. (Next.js + Mastra + Supabase)
- Supabase는 제품의 유일한 진실 원천이다. Mastra는 에이전트 런타임일 뿐이다.
- Mastra에 종속되지 않는 설계를 유지한다. 페르소나 원본과 구조화 결과는 모두 Supabase에 저장한다.
- Mastra에 문제가 생기면 Vercel AI SDK 직접 호출로 교체 가능하다. (Mastra는 내부적으로 Vercel AI SDK 사용)
- OpenClaw는 검토 결과 v1에서 제외한다. 사유: 구조화 출력 미지원 (기능 요청 "not planned"으로 닫힘), 멀티에이전트 동일 세션 불가 (에이전트당 완전 격리), 에이전트 10개 기준 ~20-25GB RAM 필요, 커스텀 앱 백엔드 용도 공식 미지원.
- DB 마이그레이션 00008 추가: `messages.delivery_status`, `agent_instances.persona_version`, `agent_instances.soul_synced_at`.

## Related

- [[Representative-Role]] — 대표 역할 정의
- [[Agent-Team]] — 조직 구성
- [[Decision-Rights]] — 권한 구조

## See Also

- [[The-Archive]] — 기록 보존 공간 (03-Spaces)
