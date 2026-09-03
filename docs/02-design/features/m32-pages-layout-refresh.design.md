# M32 Pages Layout Refresh Design Document

> **Summary**: M32 Output Hub를 빠른 탐색 중심으로 재배치하고 Dark/Light 테마를 지원한다.
>
> **Author**: Codex
> **Date**: 2026-09-01
> **Status**: Draft — 구현 승인 대기
> **Level**: Starter

---

## 1. What Are We Building?

기존 정적 HTML/CSS/JavaScript 구조와 GitHub Pages 배포 방식을 유지하면서 `/m32/`의 정보 계층, 반응형 카드 레이아웃, Interactive Lab 노출 방식을 개선한다. 현재 Dark MIDAS 스타일은 유지하고, 동일한 디자인 언어의 Light 모드를 추가한다.

## 2. Pages and Screen Inventory

| Screen | URL | Role | Change |
|--------|-----|------|--------|
| M32 Output Hub | `/MIACC_Score/m32/` | 자료 탐색 및 Interactive Lab 진입 | 레이아웃·navigation·테마 개선 |
| M32 Audio Lab | `/MIACC_Score/m32/audio-lab.html` | ORIGINAL/PROCESSED 실습 | 공통 테마 적용, 신호 graph 보존 |
| Manual HTML | `/MIACC_Score/m32/*.html` | 검증된 가이드 열람 | Hub 링크·상태만 관리, 본문 변경 제외 |
| Scene download | `/MIACC_Score/m32/*.scn` | M32 Scene 다운로드 | 카드와 download action 유지 |

화면 상태:

- Dark / Light
- Available / Latest
- Interactive Lab collapsed / expanded
- Navigation normal / sticky / mobile scroll
- Theme preference: system / stored dark / stored light

## 3. Layout Architecture

### 3.1 Desktop Wireframe (≥ 1024px)

```text
+--------------------------------------------------------------------+
| MIACC · M32 | Overview Labs Manuals Scenes References | [Sun/Moon] |
+--------------------------------------------------------------------+
| HERO                                                               |
| M32 Output Hub                                                     |
| manuals, scenes and hands-on tools                                 |
| [Open Audio Lab] [Latest Manual]             [3][1][3][1] stats   |
+--------------------------------------------------------------------+
| QUICK ACCESS                                                       |
| +----------------+ +----------------+ +----------------+           |
| | Audio Lab      | | FX Guide V2    | | Routing V2     |           |
| +----------------+ +----------------+ +----------------+           |
+--------------------------------------------------------------------+
| RESOURCE LIBRARY                                                   |
| [All] [Manuals] [Scenes] [References]                              |
| +----------------------+ +----------------------+                   |
| | available card       | | restore-required    |                   |
| +----------------------+ +----------------------+                   |
+--------------------------------------------------------------------+
| INTERACTIVE PRACTICE                                               |
| [FX Send/Return summary] [Channel Strip summary]                   |
|              [selected lab expands below]                          |
+--------------------------------------------------------------------+
| OFFICIAL REFERENCE · STATUS NOTE · FOOTER                          |
+--------------------------------------------------------------------+
```

### 3.2 Tablet Wireframe (768–1023px)

```text
+------------------------------------------------+
| M32 | horizontally compact nav | [Theme]       |
+------------------------------------------------+
| Hero copy + actions                            |
| Stats: 2 × 2                                   |
+------------------------------------------------+
| Quick Access: 2 columns                        |
| Resource Cards: 2 columns                      |
| Lab controls: 1 column                         |
+------------------------------------------------+
```

### 3.3 Mobile Wireframe (< 768px)

```text
+----------------------------------+
| MIACC · M32            [Theme]   |
| [Overview][Labs][Manuals] →      |  horizontal scroll tabs
+----------------------------------+
| M32 Output Hub                   |
| short description                |
| [Open Audio Lab — full width]    |
| [Latest Manual — full width]     |
+----------------------------------+
| Stats 2 × 2                      |
+----------------------------------+
| Quick Access                     |
| [single-column card]             |
| [single-column card]             |
+----------------------------------+
| Resource filters — scroll        |
| [single-column resource cards]   |
+----------------------------------+
| Interactive Practice             |
| [FX summary / expand]            |
| [Channel summary / expand]       |
+----------------------------------+
| Footer                           |
+----------------------------------+
```

## 4. User Flow

```text
Open /m32/
  ├─ Theme preference exists ──> apply stored Dark/Light
  └─ No preference ────────────> apply OS color scheme

Hub
  ├─ Primary CTA ──────────────> M32 Audio Lab
  ├─ Quick Access ─────────────> FX Guide V2 / Routing V2
  ├─ Resource filter ──────────> filtered cards
  ├─ Resource card ────────────> verified local asset only
  ├─ Interactive summary ──────> expand selected Lab
  └─ Theme toggle ─────────────> update data-theme + save preference
```

## 5. Components

| Component | What It Does |
|-----------|--------------|
| Utility Header | 브랜드, anchor navigation, 테마 전환 제공 |
| Theme Toggle | Dark/Light icon, accessible label, pressed state 관리 |
| Hero | 페이지 목적, primary/secondary CTA, 실제 통계 표시 |
| Quick Access Card | 최신 핵심 항목 3개를 우선 노출 |
| Filter Bar | 자료 유형별 카드 필터링 |
| Resource Card | 유형, 상태, 설명, action을 일관되게 표현 |
| Restore State Card | 손상 사유를 표시하고 action을 비활성화 |
| Lab Summary | Lab 목적과 signal path 요약, 펼치기 action 제공 |
| Lab Panel | 기존 FX/Channel controls를 선택 시 표시 |
| Footer | 공식 MIDAS 링크와 자료 상태 안내 |

## 6. Theme Design

### 6.1 Theme Behavior

1. `<head>` 초기화 script가 `localStorage['m32-theme']` 확인
2. 값이 `dark` 또는 `light`이면 즉시 `<html data-theme="...">` 적용
3. 저장값이 없으면 `prefers-color-scheme` 사용
4. toggle 클릭 시 `data-theme`, `aria-pressed`, accessible label 갱신
5. 사용자 선택을 `localStorage`에 저장
6. `color-scheme: dark light`로 native controls와 scrollbar 힌트 제공

JavaScript가 비활성화되면 CSS의 `prefers-color-scheme`이 fallback으로 동작한다.

### 6.2 Color Tokens

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `--bg` | `#0b0c0e` | `#f4f1e9` | page background |
| `--surface` | `#121419` | `#ffffff` | card and nav |
| `--surface-muted` | `#181b21` | `#ebe6da` | secondary panels |
| `--line` | `#2b2f38` | `#cec6b7` | borders |
| `--text` | `#f4f5f7` | `#1b1d21` | primary text |
| `--muted` | `#a7adb8` | `#5d626b` | secondary text |
| `--gold` | `#d4af37` | `#806512` | action/accent |
| `--gold-soft` | `#f1d47a` | `#654f0b` | labels and focus |
| `--success` | `#54d18b` | `#227447` | available state |
| `--danger` | `#ff7a7a` | `#a83c3c` | restore/error state |

Light mode에서는 금색을 어둡게 조정해 흰 배경 위 텍스트 대비를 확보한다. 색상만으로 상태를 전달하지 않고 badge 문구와 icon을 함께 사용한다.

### 6.3 Theme Toggle Specification

- 위치: Utility Header 우측
- 크기: 최소 44×44px
- 형태: icon + desktop label, mobile icon only
- label: 현재 상태가 아닌 실행 결과를 설명 (`Light mode로 전환`)
- keyboard: native `<button>` 사용, Enter/Space 지원
- focus: `2px solid var(--gold-soft)` + offset
- motion: 160ms 이하, `prefers-reduced-motion`에서는 transition 제거

## 7. Responsive Rules

| Breakpoint | Navigation | Cards | Lab |
|------------|------------|-------|-----|
| `< 640px` | 브랜드+toggle, anchor tabs 가로 scroll | 1열 | controls 1열, 기본 접힘 |
| `640–767px` | compact top nav | 1열 | controls 1열 |
| `768–1023px` | full nav, 간격 축소 | 2열 | outer 1열, control 2열 허용 |
| `≥ 1024px` | sticky full nav | Quick 3열, resource 2열 | summary 2열, selected panel full width |
| `≥ 1280px` | max-width 1200–1240px | 여백 확대 | 기존 최대 content width 유지 |

공통 규칙:

- page gutter: mobile 16px / tablet 22px / desktop 28px
- section spacing: mobile 40px / desktop 64px
- card minimum touch target: 44px
- 긴 파일명: `overflow-wrap:anywhere`
- horizontal page overflow 금지

## 8. Interaction and Accessibility

- sticky header anchor 이동 시 `scroll-margin-top` 적용
- 현재 filter와 Lab tab에 `aria-pressed` 또는 적절한 tab semantics 적용
- Lab collapse trigger에 `aria-expanded`, panel에 `aria-controls` 적용
- 테마 toggle과 상태 badge에 시각적·텍스트 정보를 함께 제공
- heading은 `h1 → h2 → h3` 순서 유지
- focus visible을 hover와 별도로 설계
- 두 테마에서 일반 텍스트 4.5:1, 큰 텍스트 3:1 대비 목표
- `prefers-reduced-motion: reduce` 지원

## 9. Files to Modify

```text
public/m32/index.html                    # Hub structure, tokens, theme and layout JS
public/m32/audio-lab.html                # shared theme tokens/toggle if approved
m32-pages-assets/index.html.gz.b64       # rebuilt source asset for Hub
scripts/check-m32-pages.mjs              # theme controls and link regression checks
docs/02-design/features/...design.md     # this design
docs/02-design/mockup.md                 # compact review wireframe
```

수정 금지/보존:

- `public/m32/audio-lab.js`의 Web Audio graph
- 검증된 manuals/scenes 내용
- `.github/workflows/deploy.yml`의 Pages artifact deployment 구조
- `m32-pages-assets/incomplete-assets.json`에 기록된 손상 상태

## 10. Verification Plan

| Test | Expected Result |
|------|-----------------|
| Theme first visit with dark OS | Dark 적용 |
| Theme first visit with light OS | Light 적용 |
| Toggle and reload | 선택한 테마 유지 |
| localStorage unavailable | 시스템 설정 또는 Dark fallback, 페이지 정상 사용 |
| Keyboard navigation | header, filters, cards, Lab, toggle 모두 접근 가능 |
| 360/768/1024/1440 viewport | 가로 overflow 없음, 정의된 column 적용 |
| Resource cards | 모든 내부 href의 실제 배포 파일 존재 |
| `npm run build` | exit code 0 |
| M32 link checker | missing link 0 |
| Local/Pages HTTP | Hub와 정상 자료 200 |
| Audio Lab regression | ORIGINAL/PROCESSED 고정 graph 및 JS syntax 유지 |

## 11. Implementation Order

1. Theme tokens와 초기화 script
2. Utility Header와 theme toggle
3. Hero와 Quick Access 재배치
4. Resource Library 카드 상태 통합
5. Interactive Lab progressive disclosure
6. Responsive와 accessibility 보완
7. Hub 압축 asset 재생성
8. build/link/viewport/HTTP 회귀 검사

## 12. Checklist

- [x] Screen inventory
- [x] Desktop/tablet/mobile wireframes
- [x] User flow
- [x] Responsive breakpoints
- [x] Theme behavior and tokens
- [x] Component inventory
- [x] Accessibility requirements
- [x] Verification plan
- [ ] 사용자 Design 승인
- [ ] 구현 시작

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-09-01 | Initial responsive Dark/Light layout design | Codex |
