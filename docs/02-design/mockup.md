# M32 Output Hub Layout Mockup

> 상세 설계: `features/m32-pages-layout-refresh.design.md`

## Screen Inventory

- M32 Output Hub — Dark/Light, responsive resource library
- M32 Audio Lab — 기존 audio graph 보존
- Manual viewer — 기존 문서 보존
- Scene download — 기존 download 동작 보존

## Primary Flow

```text
Hub → Audio Lab
    → Latest Manual
    → Latest Scene
    → Filtered Resources
    → Expanded FX/Channel Lab
    → Official Reference
```

## Desktop

```text
[Brand] [Overview Labs Manuals Scenes References] [Theme]
[Hero copy + 2 CTAs]                         [Stats]
[Audio Lab] [FX Guide V2] [Routing V2]
[Filters]
[Resource Card] [Resource Card]
[FX Summary] [Channel Summary]
[Selected Lab full width]
[Footer]
```

## Mobile

```text
[Brand]                              [Theme]
[Scrollable anchor navigation]
[Hero]
[Primary CTA]
[Stats 2 × 2]
[Quick cards: 1 column]
[Resource cards: 1 column]
[Collapsed Lab summaries]
[Footer]
```

## Theme States

```text
No saved preference → OS scheme
Saved dark          → Dark MIDAS theme
Saved light         → Light MIDAS theme
Toggle              → instant update + persist
```

## Review Gate

- Dark는 현재 분위기를 유지한다.
- Light는 단순 반전이 아니라 별도 대비 token을 사용한다.
- Audio Lab graph와 배포 자산은 레이아웃 변경과 분리해 보존한다.
