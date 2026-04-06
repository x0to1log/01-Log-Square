# Pixel Asset Index

PixelLab MCP로 생성된 에셋 목록. 2026-04-07 기준.

## 생성 공통 설정

```
tool: PixelLab MCP (api.pixellab.ai)
method: create_map_object (캐릭터 포함)
size: 48x48 (캐릭터), 32x32~48x48 (오브젝트)
style: single color outline, flat shading, low detail
view: side
prompt prefix: "large round blob catloaf filling the entire canvas, oval bread loaf body, two small triangle ears, dot eyes, tiny w mouth, round pink cheeks, ... no visible legs, cute pixel art, zoomed in, big, close-up"
```

## 테마 팔레트 (0to1log 참고)

| 공간 | 테마 | 배경 | 액센트 |
|------|------|------|--------|
| The Lobby | Dark | `#181412` | `#C3A370` |
| The Meeting Room | Midnight | `#08090E` | `#C4B07A` |
| The Archive | Light | `#F4F1EA` | `#6B4226` |
| The Individual Zones | Pink | `#FFF5F7` | `#E8496A` |

## Characters (캣로프 고양이)

| 역할 | 슬러그 (= DB key) | 모색 | 파일 | 상태 |
|------|-------------------|------|------|------|
| 대표 (CEO) | ceo | 검은 턱시도 + 금 나비넥타이 | `characters/ceo/south.png` | 완료 |
| COO | coo | 따뜻한 회갈색 줄무늬 | `characters/coo/south.png` | 완료 |
| CSO | cso | 크림 + 핑크 포인트 (샴) | `characters/cso/south.png` | 완료 |
| CTO | cto | 진한 오렌지 + 흰 배 | `characters/cto/south.png` | 완료 |
| Risk Critic | risk_critic | 올블랙 + 빨간 배지 | `characters/risk_critic/south.png` | 완료 |
| Verifier | verifier | 흰 바탕 + 검정/오렌지 패치 (삼색) | `characters/verifier/south.png` | 완료 |
| Doc Manager | documentation_manager | 블루그레이 | `characters/documentation_manager/south.png` | 완료 |
| Builder | builder | 레몬 옐로우 | `characters/builder/south.png` | 완료 |
| Brand Designer | brand_designer | 실버 라일락 (연보라) | `characters/brand_designer/south.png` | 완료 |
| Content Creator | content_creator | 베이지 + 호랑이 줄무늬 | `characters/content_creator/south.png` | 완료 |
| Trend Scout | trend_scout | 흰 얼굴 + 검정 등 (역턱시도) | `characters/trend_scout/south.png` | 완료 |

### 캐릭터 파일 구조

```
characters/{slug}/
└── south.png       ← 정면 캣로프 (48x48, 투명 배경)
```

> 방향별 뷰(east/north/west)와 애니메이션은 v2에서 추가 예정.

## Map — Tilesets (탑다운 바닥)

| 파일 | 공간 | 설명 | PixelLab ID | 상태 |
|------|------|------|-------------|------|
| tilesets/dark-floor.png | Lobby | 따뜻한 나무 바닥 | — | 미생성 |
| tilesets/midnight-floor.png | Meeting Room | 차가운 콘크리트/메탈 | — | 미생성 |
| tilesets/light-floor.png | Archive | 크래프트 타일/종이 | — | 미생성 |
| tilesets/pink-floor.png | Individual Zones | 밝은 카펫 | — | 미생성 |

## Map — Props (에이전트 소품 + 공용 가구)

| 파일 | 크기 | 연관 에이전트 | PixelLab ID | 상태 |
|------|------|--------------|-------------|------|
| props/checklist-board.png | 32x32 | COO | — | 미생성 |
| props/file-cabinet.png | 32x32 | COO | — | 미생성 |
| props/whiteboard.png | 48x32 | CSO | — | 미생성 |
| props/card-stack.png | 32x32 | CSO | — | 미생성 |
| props/monitor.png | 32x32 | CTO | — | 미생성 |
| props/server-rack.png | 32x48 | CTO | — | 미생성 |
| props/warning-light.png | 32x32 | Risk Critic | — | 미생성 |
| props/danger-sign.png | 32x32 | Risk Critic | — | 미생성 |
| props/check-board.png | 32x32 | Verifier | — | 미생성 |
| props/approval-stamp.png | 32x32 | Verifier | — | 미생성 |
| props/document-box.png | 32x32 | Doc Manager | — | 미생성 |
| props/archive-chest.png | 32x32 | Doc Manager | — | 미생성 |
| props/desk-basic.png | 48x32 | 공용 | — | 미생성 |
| props/chair.png | 32x32 | 공용 | — | 미생성 |

## Map — Decorations (장식)

| 파일 | 크기 | PixelLab ID | 상태 |
|------|------|-------------|------|
| decorations/plant-pot.png | 32x32 | — | 미생성 |
| decorations/bookshelf.png | 48x48 | — | 미생성 |
| decorations/water-cooler.png | 32x48 | — | 미생성 |

## UI

| 파일 | 용도 | PixelLab ID | 상태 |
|------|------|-------------|------|
| ui/icons/lobby-icon.png | 방 내비게이션 | — | 미생성 |
| ui/icons/meeting-icon.png | 방 내비게이션 | — | 미생성 |
| ui/icons/archive-icon.png | 방 내비게이션 | — | 미생성 |
| ui/icons/dm-icon.png | 방 내비게이션 | — | 미생성 |
| ui/empty-states/no-messages.png | 빈 대화 | — | 미생성 |

## 재생성 시 통일 기준

```
method: create_map_object
view: "side"
outline: "single color outline"
shading: "flat shading"
detail: "low detail"
canvas: 48x48 (캐릭터), 32x32~48x48 (오브젝트)
style: catloaf blob, round, chubby, kawaii, bold outline
```
