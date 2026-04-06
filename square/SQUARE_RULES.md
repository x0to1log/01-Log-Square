---
title: Square 운영 규칙
date: 2026-04-06
tags:
  - meta
  - square
---

# Square 운영 규칙

> `square`는 01 Log Square 프로젝트의 Obsidian 기반 운영 공간이다. 이 공간은 대표와 에이전트 조직이 내린 판단, 프로젝트 흐름, 운영 규칙을 한곳에 축적하기 위한 단일 진실 원천이다.

---

## 레이어 구조

| 레이어 | 역할 |
|--------|------|
| `00-Root` | 인덱스, 현재 스프린트, 빠른 진입점 |
| `01-Core` | 비전, 대표 역할, 로드맵 |
| `02-Organization` | 조직도, 권한, 보고 체계, 회의 흐름 |
| `03-Spaces` | 가상 오피스 공간 설계 |
| `04-Projects` | 프로젝트 포트폴리오와 상태 |
| `05-Operations` | 운영 리듬, SOP, 실행 규칙 |
| `06-Brand` | 톤앤매너, 브랜드 바이브 |
| `07-Research` | 트렌드, 경쟁사, 외부 신호 |
| `08-Design` | 제품 UX와 오피스 경험 설계 |
| `09-Implementation` | 기술 스택, 실행 계획, 설계 문서 |
| `10-Journal` | 빠른 의사결정 로그와 세션 기록 |
| `11-Inbox` | 임시 메모와 미분류 아이디어 |
| `90-Archive` | 종료된 노트 보관 |
| `99-Reference` | 참고 자료와 용어 |

---

## 노트 원칙

1. 모든 핵심 노트는 frontmatter에 `title`과 `tags`를 가진다.
2. 같은 레이어의 관련 노트는 `## Related`에서 연결한다.
3. 다른 레이어의 중요한 노트는 `## See Also`에서 최대 2개까지 연결한다.
4. 운영상 확정된 판단은 반드시 [[QUICK-DECISIONS]] 또는 관련 핵심 문서에 남긴다.
5. 아직 확정되지 않은 생각은 먼저 `11-Inbox`에 넣고, 정리 후 승격한다.

---

## 파일명 규칙

| 유형 | 형식 | 예시 |
|------|------|------|
| 일반 노트 | `Title-Case-Hyphens.md` | `Project-Vision.md` |
| 계획 문서 | `YYYY-MM-DD-slug.md` | `2026-04-06-square-vault-bootstrap.md` |
| 인박스 메모 | `YYYY-MM-DD-slug.md` | `2026-04-06-square-vault-kickoff.md` |
| 로그 문서 | 고정 이름 | `QUICK-DECISIONS.md` |
| 메타 문서 | 대문자 | `SQUARE_RULES.md` |

---

## 운영 기준

- 대표가 최종 승인하지 않은 내용은 초안으로 간주한다.
- QA가 `Red Flag`를 올린 안건은 대표의 명시적 override 전까지 진행하지 않는다.
- COO가 정리한 액션 아이템과 도큐멘테이션 매니저가 남긴 기록이 공식 버전이다.

## Related

- [[00-INDEX]] — square 전체 진입점
- [[Project-Vision]] — 프로젝트 비전
- [[Implementation-Plan]] — 실행 규칙과 문서화 원칙

## See Also

- [[Agent-Team]] — 조직 구성과 역할 (02-Organization)
- [[Operating-Rhythm]] — 운영 리듬과 리뷰 주기 (05-Operations)
