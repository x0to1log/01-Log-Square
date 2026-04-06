---
title: Office UX Direction
date: 2026-04-06
tags:
  - design
  - ux
  - workspace
---

# Office UX Direction

> 01 Log Square의 UX는 채팅 앱처럼 편하게 쓰이되, 대표가 팀을 운영하는 워크스페이스처럼 느껴져야 한다.

## 핵심 경험

- 프로젝트 목록에서 오늘의 우선순위를 읽는다.
- 프로젝트에 들어가면 floorplan workspace가 열린다.
- 기본으로 War Room에서 판단 재료를 받는다.
- 필요하면 각 에이전트와 DM을 나누고 다시 War Room로 가져온다.
- 아카이브에서 과거 결정을 되짚는다.

## UI 원칙

- 사람 수보다 책임 구조가 먼저 보이게 한다.
- 메시지 흐름보다 `결론`, `리스크`, `다음 액션`이 먼저 보이게 한다.
- 프로젝트 중심과 사람 중심 탐색을 모두 지원한다.
- 대표의 승인 행위가 시각적으로 분명해야 한다.
- 메신저 감각은 유지하되, 데이터 구조는 프로젝트 운영 툴에 가깝게 설계한다.
- 도면은 장식이 아니라 방의 상태와 역할을 읽게 하는 내비게이션이어야 한다.

## 정보 구조

- `Home`: 프로젝트 목록
- `Project Workspace`: 하이브리드 플로어플랜 워크스페이스
- `Default Open`: War Room
- `Secondary Mode`: Individual Zones DM
- `Companion Layer`: 01-Mobile

## 화면 구조

- 왼쪽: War Room과 각 에이전트 DM 스레드
- 가운데: 현재 대화
- 오른쪽: `결정 / 리스크 / 다음 액션 / 관련 문서`
- 별도 보기: 탑다운 픽셀 오피스 맵

## 픽셀 사용 전략

- 탑다운 1타일 캐릭터와 조형물을 활용한 옛 JRPG 감성의 오피스 맵을 사용한다.
- 픽셀은 프로젝트 홈, 미니맵, 방 일러스트, 아바타, 상태 오브젝트에만 사용한다.
- 긴 텍스트, 채팅 본문, 문서 패널, 복잡한 입력 UI는 현대적 레이아웃으로 유지한다.
- 귀여움은 전체 UI보다 `작은 상태 변화와 공간 오브젝트`에서 만든다.

## 대표 캐릭터

- 대표 캐릭터는 맵 안에 직접 보인다.
- 직접 이동형보다는 `앵커 캐릭터형`으로 다룬다.
- 현재 집중 중인 방에 대표가 존재하는 방식으로 상태를 표현한다.

## 디자인 키워드

- editorial
- operations room
- premium internal tool
- calm hierarchy
- deliberate motion
- top-down pixel accents
- hybrid floorplan workspace

## Related

- [[Space-Map]] — UX가 담아야 할 공간 구조
- [[Brand-Vibe]] — 표현 감각
- [[Decision-Rights]] — UX에 반영할 권한 구조
- [[Hybrid-Floorplan-Workspace]] — 현재 승인된 UX 방향
- [[Project-Workspace-Layout]] — 전체 레이아웃 shell
- [[Pixel-Accent-System]] — 픽셀 사용 원칙

## See Also

- [[Tech-Stack]] — 구현 기반 (09-Implementation)
- [[War-Room-Layout]] — War Room 화면 설계
- [[Individual-Zones-Layout]] — Individual Zones 화면 설계
- [[Mobile-Companion-Layout]] — 01-Mobile 화면 설계
