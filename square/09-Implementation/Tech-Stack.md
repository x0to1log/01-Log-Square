---
title: Tech Stack
date: 2026-04-06
updated: 2026-04-06
tags:
  - implementation
  - tech
  - stack
---

# Tech Stack

> 현재까지 합의한 01 Log Square v1 기술 스택. 핵심은 `웹 우선`, `Supabase 중심 데이터 구조`, `Mastra 기반 에이전트 오케스트레이션`, `TypeScript 단일 스택`이다.

---

## 현재 합의한 스택

| 영역 | 선택 | 역할 |
|------|------|------|
| Frontend | Next.js + TypeScript | 프로젝트 목록, Meeting Room, DM, Map, 대표 UI |
| UI System | Tailwind CSS | 반응형 웹 UI, 오피스형 인터페이스 레이아웃 |
| Motion | CSS/Framer Motion 최소 사용 | 상태 전환, 맵 전환, 작은 상호작용 |
| Database/Auth/Realtime | Supabase | 인증, Postgres, Realtime, Storage |
| Agent Runtime | Mastra | 에이전트 오케스트레이션, 구조화 출력, Supervisor 패턴, 메모리 |
| AI SDK | Vercel AI SDK (Mastra 내부) | 스트리밍, generateObject, LLM 프로바이더 추상화 |
| AI Models | OpenAI API | 대화 생성, 요약, 역할별 응답, 구조화 출력 |
| Docs | Obsidian Markdown (`square`) | 초기 운영 지식 공간과 설계 기준 |
| Pixel Assets | Pixellab MCP + 정적 자산 | 맵, 캐릭터, 방 오브젝트, 상태 포인트 |

## 플랫폼 전략

### 웹 우선

- v1은 웹 앱으로 만든다.
- 데스크톱 브라우저 사용성을 우선한다.
- 프로젝트 목록, Meeting Room, DM, 운영 패널은 웹에서 완성한다.

### 모바일은 반응형/컴패니언 우선

- 처음부터 네이티브 앱을 만들지 않는다.
- 모바일은 웹사이트 접속으로 사용하는 반응형 경험을 먼저 만든다.
- 역할은 `빠른 확인 / 승인 / 짧은 응답 / 메모` 중심이다.
- 네이티브 앱은 나중에 필요성이 검증되면 별도 트랙으로 분리한다.

## 아키텍처 핵심 원칙

### Supabase는 제품의 진실 원천, Mastra는 에이전트 런타임

이 경계가 이 프로젝트의 아키텍처를 결정하는 핵심 규칙이다.

- **Supabase가 소유하는 것:** 프로젝트, 결정, 리스크, 액션, 검증, 노트, 메시지 사본, 에이전트 페르소나 원본
- **Mastra가 소유하는 것:** 에이전트 실행, LLM 호출, Supervisor 라우팅, 대화 세션 컨텍스트
- **진실 원천은 하나:** Mastra의 메모리도 Supabase Postgres에 저장하므로, 데이터 진실 원천이 자연스럽게 단일화된다.

### Mastra에 종속되지 않는 설계

- 에이전트 페르소나(SOUL)는 Supabase `agent_templates`에 저장하고 Mastra에 주입한다.
- 구조화 결과(decisions, actions, reviews)는 무조건 Supabase에 저장한다.
- Mastra의 메모리는 편의 기능으로만 사용한다. 없어도 제품은 동작해야 한다.
- Mastra에 문제가 생기면 Vercel AI SDK 직접 호출로 교체할 수 있다. (Mastra는 내부적으로 Vercel AI SDK를 사용한다.)

## 역할 분리

### Next.js가 맡는 일

- 화면 렌더링
- 사용자 상호작용
- 프로젝트/스레드 탐색 UI
- Meeting Room, DM, Map 전환
- 대표 승인 UI
- Mastra 에이전트 호출 (API Routes / Server Actions)
- 에이전트 응답에서 구조화 결과 추출 → Supabase 저장
- 권한 체크, 비즈니스 로직

### Supabase가 맡는 일

- 사용자 인증
- 프로젝트/스레드/메시지/결정/리스크/액션 저장 (제품 진실 원천)
- 실시간 반영 (Realtime)
- 파일/픽셀 자산 저장 (Storage)
- Mastra 에이전트 메모리 저장 (같은 Postgres)
- 필요 시 Edge Functions (Deno/TypeScript)

### Mastra가 맡는 일

- 에이전트 오케스트레이션 (Supervisor 패턴으로 Meeting Room 멀티에이전트)
- LLM 프롬프트 조합 및 호출
- Zod 스키마 기반 구조화 출력 (decisions, actions, reviews 추출)
- 에이전트별 메모리 관리 (message history, working memory, semantic recall)
- DM 단일 에이전트 대화 (`agent.generate()` 직접 호출)
- 스트리밍 응답 (Vercel AI SDK `streamText` + `useChat` 활용)

## OpenClaw 검토 결과

OpenClaw를 에이전트 런타임으로 검토했으나, v1 핵심 스택에서는 제외한다.

**제외 사유:**

- 구조화 출력 미지원 (기능 요청이 "not planned"으로 닫힘)
- 멀티에이전트 동일 세션 불가 (세션이 에이전트당 완전 격리)
- 에이전트 10개 기준 ~20-25GB RAM 필요 (개인 프로젝트에 과한 인프라)
- 개인 어시스턴트용 설계로, 커스텀 앱 백엔드 용도는 공식 지원 아님
- Supabase 연동이 Composio 제3자 서비스 경유 (직접 연결 아님)

**향후 가능성:**

- 외부 채널 연동(WhatsApp, Slack 등)이 필요해지면 재검토 가능
- 에이전트 런타임 자체의 용도가 아닌, 메시징 게이트웨이로서의 가치는 있음

## 왜 TypeScript 단일 스택인가

- Next.js(프론트) + Mastra(에이전트) + Supabase Edge Functions(서버 로직) 모두 TypeScript다.
- 언어 전환 비용이 없다.
- 타입을 프론트에서 백엔드까지 공유할 수 있다. (Zod 스키마 → DB 타입 → UI 타입)
- 별도 서버 프로세스가 불필요하다. Mastra는 Next.js API Routes 안에서 실행된다.
- Python은 v1에서 필요하지 않다. 나중에 ML 모델이나 특수 데이터 처리가 필요하면 그때 Edge Function 또는 별도 서비스로 추가한다.

## 나머지 아키텍처 원칙

- 사람/조직/프로젝트/결정은 별도 엔터티로 분리한다.
- 메시지보다 `프로젝트 운영 구조`를 우선 저장한다.
- Mastra는 지능형 처리 계층이고, 저장 구조의 단일 원천이 되어서는 안 된다.
- 제품 내부 정보 구조는 `square`의 문서 구조와 최대한 대응시킨다.

## 나중에 정할 것

- Realtime 채널 설계
- 인증 방식 세부 정책
- 배포 환경 (Vercel + Supabase hosted)
- Mastra 메모리 테이블과 제품 테이블의 구체적 연결 방식
- 모바일 앱 분리 여부

## 이번 결정의 의미

이 스택 선택은 `빠르게 검증 가능한 제품 뼈대`를 우선 확보하기 위한 것이다. TypeScript 단일 스택으로 통일하고, Mastra를 에이전트 런타임으로 채택함으로써 별도 서버 프로세스 없이 Next.js 안에서 전체 앱이 동작하는 구조를 만든다. 구조화 출력과 멀티에이전트 Supervisor 패턴이 네이티브로 지원되므로, Meeting Room과 DM의 핵심 시나리오를 프레임워크 수준에서 해결할 수 있다.

## Related

- [[Implementation-Plan]] — 구현 기준
- [[Office-UX-Direction]] — 프런트엔드 방향
- [[Project-Vision]] — 왜 이런 스택을 고려하는지
- [[Project-Workspace-Layout]] — 이 스택이 지탱할 화면 구조

## See Also

- [[Agent-Team]] — 시스템이 다뤄야 할 행위자 (02-Organization)
- [[Mobile-Companion-Layout]] — 모바일 범위 (08-Design)

