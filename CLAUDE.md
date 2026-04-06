# 01 Log Square

> From 0 to 1, Every Log Matters.

대표와 직원형 AI 에이전트들이 함께 0→1 프로젝트를 운영하고, 모든 판단을 로그로 축적하는 개인용 가상 운영실.

## Project Structure

```
01 Log Square/
├── square/          # Obsidian vault — 운영 지식 공간 (문서/설계/결정 기록)
├── supabase/        # Supabase migrations (00001~00008)
├── app/             # Next.js application (TypeScript)
└── .env             # API keys (gitignored)
```

## Tech Stack (확정)

- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Agent Runtime**: Mastra (`@mastra/core`) — Next.js API Routes 안에서 실행
- **AI SDK**: Vercel AI SDK (Mastra 내부) + OpenAI API
- **Database**: Supabase (Postgres + Auth + Realtime + Storage)
- **Language**: TypeScript 단일 스택 (Python 없음)

## Architecture Principles

1. **Supabase는 제품의 유일한 진실 원천.** Mastra는 에이전트 런타임일 뿐, 제품 상태를 소유하지 않는다.
2. **Mastra에 종속되지 않는 설계.** 페르소나 원본은 Supabase `agent_templates`에, 구조화 결과도 Supabase에 저장.
3. **진실 원천은 하나.** Mastra 메모리도 Supabase Postgres에 저장하여 단일화.
4. **Mastra 폴백**: 문제 시 Vercel AI SDK 직접 호출로 교체 가능.

## Agent Organization (10명)

### Strategic Core (항상 활성)
- COO — 로드맵, 마일스톤, 액션 아이템
- CSO — 방향성, 전략, 포지셔닝
- CTO — 기술 구조, 구현 현실성

### Review Core (항상 활성)
- Risk Critic — 허점, 리스크, 반대 의견
- Verifier — 체크리스트, 사실 확인

### Support / Execution
- Documentation Manager — 회의록, SOP, 공식 기록
- Builder — 구현 초안, 프로토타입

### Specialists (온디맨드)
- Brand Designer, Content Creator, Trend Scout

## Key Spaces (UI)

- **The Lobby** — 프로젝트 목록 홈
- **The Meeting Room** — 프로젝트 기본 회의 (멀티에이전트, Mastra Supervisor 패턴)
- **The Individual Zones** — 에이전트별 DM
- **The Archive** — 결정, 회의록, SOP 보관

## Conventions

- 한국어로 커뮤니케이션
- Commit messages는 영어 (conventional commits)
- square/ 문서 수정 시 SQUARE_RULES.md 규칙 준수
- 빠른 의사결정은 `square/10-Journal/QUICK-DECISIONS.md`에 기록

## Important Files

- `square/09-Implementation/Tech-Stack.md` — 기술 스택 상세
- `square/09-Implementation/Database-Schema.md` — DB 마이그레이션 설명
- `square/09-Implementation/Implementation-Plan.md` — 구현 트랙
- `square/02-Organization/Agent-Team.md` — 에이전트 조직 구조
- `square/08-Design/Hybrid-Floorplan-Workspace.md` — UX 방향
