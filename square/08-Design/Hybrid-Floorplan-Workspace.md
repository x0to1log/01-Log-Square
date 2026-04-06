---
title: Hybrid Floorplan Workspace
date: 2026-04-06
tags:
  - design
  - ux
  - approved-direction
---

# Hybrid Floorplan Workspace

> 현재까지 합의된 01 Log Square의 핵심 UX 방향. `프로젝트 홈은 오피스 도면, 방 안은 메신저, 오른쪽은 운영 패널` 구조를 기본으로 한다.

---

## 핵심 개념

- 프로젝트 목록이 기본 진입점이다.
- 프로젝트를 열면 floorplan workspace가 열린다.
- 기본으로 [[The-Boardroom|The War Room]]이 선택된다.
- 필요하면 [[The-Individual-Zones]]에서 각 에이전트와 DM을 나눈다.
- 모든 대화는 결국 프로젝트 운영 구조 안으로 환원된다.

## 레이아웃

- 상단: 프로젝트명, 현재 phase, 열린 리스크, 대기 승인
- 왼쪽: War Room + 에이전트 DM 목록
- 가운데: 현재 대화
- 오른쪽: 결정, 리스크, 다음 액션, 관련 문서
- 별도 보기 또는 홈 레이어: 탑다운 픽셀 오피스 맵

## 픽셀 전략

- 옛 탑다운 RPG 감성의 1타일 캐릭터와 조형물을 사용한다.
- 픽셀은 공간 정체성, 상태 표현, 귀여운 포인트에만 쓴다.
- 텍스트 가독성과 운영 정보는 현대적 UI로 유지한다.
- 직접 이동형 게임성보다 빠른 방 전환이 우선이다.

## 대표 캐릭터

- 대표 캐릭터는 맵 안에 보인다.
- 현재 집중 중인 방에 대표가 존재하는 방식으로 상태를 표현한다.
- 대표는 맵의 주인공이지만, 게임처럼 조작하는 대상이 아니라 오피스의 앵커다.

## 승인된 용어

- `The Lobby` — 프로젝트 목록 홈
- `The War Room` — 기본 진입 회의방
- `The Individual Zones` — 에이전트별 DM 구역
- `01-Mobile` — 대표용 컴패니언 채널

## 하지 않으려는 것

- 전체 UI를 픽셀로 덮는 방식
- 텍스트와 패널까지 게임 UI처럼 만드는 방식
- 모든 에이전트가 동시에 떠드는 메신저형 구조
- 프로젝트 맥락 없이 DM이 흩어지는 구조

## Related

- [[Office-UX-Direction]] — 상위 UX 원칙
- [[Space-Map]] — 공간 구조
- [[Implementation-Plan]] — 제품으로 옮길 기준
- [[Project-Workspace-Layout]] — 공통 shell 상세
- [[War-Room-Layout]] — 기본 진입 화면 상세
- [[Individual-Zones-Layout]] — 개별 DM 화면 상세

## See Also

- [[The-Project-Rooms]] — 프로젝트 shell (03-Spaces)
- [[01-Mobile]] — 보조 채널 (03-Spaces)
- [[Mobile-Companion-Layout]] — 모바일 상세
- [[Pixel-Accent-System]] — 픽셀 시각 규칙
