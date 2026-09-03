# M32 Pages Layout Refresh Planning Document

> **Summary**: M32 Output Hub의 정보 구조와 반응형 레이아웃을 개선해 자료 탐색과 Audio Lab 진입을 빠르고 명확하게 만든다.
>
> **Project**: MIACC_Score
> **Version**: 0.1
> **Author**: Codex
> **Date**: 2026-09-01
> **Status**: Draft — 사용자 검토 대기

---

## 1. Overview

### 1.1 Purpose

현재 `/m32/` 페이지의 긴 단일 흐름을 명확한 탐색 구조로 재편하고, 데스크톱과 모바일에서 핵심 자료와 실습 기능에 더 빠르게 접근할 수 있도록 한다. 기존 검정/금색 MIDAS 스타일, 정상 배포 자료, Audio Lab 기능은 유지한다.

### 1.2 Background

현재 페이지에는 다음 콘텐츠가 한 페이지에 밀집되어 있다.

- Hero와 배포 자료 통계
- M32 Audio Lab 및 2개의 인라인 Interactive Lab
- Manuals & Guides
- Scene Files
- References와 자료 상태

콘텐츠 종류와 상태는 명확하지만, 페이지 길이가 길고 Interactive Lab의 상세 UI가 자료 목록보다 먼저 크게 노출되어 사용 목적별 탐색이 어렵다. 모바일에서는 카드와 복잡한 실습 제어 영역을 연속해서 스크롤해야 한다.

### 1.3 Related Documents

- 현재 Hub: `public/m32/index.html`
- 기존 Audio Lab: `public/m32/audio-lab.html`, `public/m32/audio-lab.js`
- 배포 링크 검사: `scripts/check-m32-pages.mjs`
- 자산 상태: `m32-pages-assets/incomplete-assets.json`

---

## 2. Scope

### 2.1 In Scope

- [ ] Hero를 핵심 설명, 빠른 실행 버튼, 검증 자료 통계 중심으로 단순화
- [ ] 현재 검정/금색 Dark 테마를 기본 시각 정체성으로 유지하고 Light 모드 추가
- [ ] OS 테마 감지, 사용자 전환, 선택값 저장을 지원
- [ ] Manuals, Scenes, Labs, References로 바로 이동하는 반응형 상단 탐색 제공
- [ ] 자료 카드의 최신·제공 상태를 일관된 시각 언어로 정리
- [ ] Interactive Lab을 기본 접힘 또는 별도 진입 구조로 변경해 Hub의 정보 밀도 완화
- [ ] 데스크톱 2~3열, 태블릿 2열, 모바일 1열의 명확한 카드 그리드 정의
- [ ] 모바일 터치 영역, 글자 크기, 여백, 긴 파일명 처리 개선
- [ ] 키보드 탐색, focus 표시, 명도 대비, heading 구조 점검
- [ ] 기존 상대경로와 GitHub Project Pages 호환성 유지
- [ ] 실제 배포 자료 수에 맞춘 통계 자동 또는 단일 소스 관리 검토

### 2.2 Out of Scope

- M32 매뉴얼 및 Scene 내용 자체의 수정
- 손상된 압축 자료의 추정 복원
- Audio Lab DSP 알고리즘의 전면 재작성
- React 기반 M32 페이지로의 마이그레이션
- GitHub Pages 배포 방식 변경
- MIACC Score 본체 React 애플리케이션의 레이아웃 변경

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 첫 화면에서 Hub 목적, 최신 Audio Lab, 핵심 자료 진입점을 확인할 수 있어야 한다. | High | Pending |
| FR-02 | 사용자는 1회 클릭으로 Manuals, Scenes, Labs, References 섹션에 이동할 수 있어야 한다. | High | Pending |
| FR-03 | 카드마다 Available, Latest 상태가 일관되게 표시되어야 한다. | High | Pending |
| FR-04 | 검증된 배포 자료만 다운로드 링크로 제공되어야 한다. | High | Pending |
| FR-05 | M32 Audio Lab, FX Lab, Channel Lab을 구분해 진입할 수 있어야 한다. | High | Pending |
| FR-06 | 인라인 Lab은 접기/펼치기 또는 명확한 탭으로 콘텐츠 목록을 방해하지 않아야 한다. | Medium | Pending |
| FR-07 | 모든 내부 링크는 `/MIACC_Score/m32/`에서 정상 동작해야 한다. | High | Pending |
| FR-08 | 모바일에서 필터, 카드, Lab controls가 가로 스크롤 없이 동작해야 한다. | High | Pending |
| FR-09 | 배포 자료 통계는 실제 제공 파일과 일치해야 한다. | Medium | Pending |
| FR-10 | Dark/Light 전환 버튼을 제공하고 페이지 재로드 없이 전체 UI에 적용해야 한다. | High | Pending |
| FR-11 | 저장된 사용자 선택이 없으면 OS 테마를 따르고, 선택 후에는 브라우저에 기억해야 한다. | High | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Responsive | 360px, 768px, 1024px, 1440px에서 가로 overflow 없음 | 브라우저 viewport 검사 |
| Accessibility | 두 테마 모두 의미 있는 heading 순서, 키보드 focus 표시, 주요 텍스트 WCAG AA 대비 목표 | axe/Lighthouse 및 키보드 점검 |
| Usability | Hero에서 주요 섹션 또는 Audio Lab까지 최대 1회 클릭 | 수동 사용자 흐름 검사 |
| Integrity | 기존 정상 manual, scene, Audio Lab 링크와 기능 보존 | `npm run build`, 링크 검사, HTTP 검사 |
| Performance | 외부 UI 프레임워크나 대형 이미지 의존성 추가 없음 | diff 및 build artifact 확인 |
| Maintainability | 상태 스타일과 카드 구조의 중복을 줄이고 CSS 영역을 명확히 구분 | 코드 리뷰 |

---

## 4. Proposed Information Architecture

1. **Sticky Utility Navigation**
   - Overview / Labs / Manuals / Scenes / References
   - 우측에 Dark/Light 테마 전환 버튼
   - 모바일에서는 가로 스크롤 가능한 compact tabs 또는 menu 사용
2. **Hero**
   - 한 문장 설명
   - Primary CTA: M32 Audio Lab
   - Secondary CTA: 최신 Manual / Scene
   - 검증된 자료 통계만 표시
3. **Quick Access**
   - Latest 항목 3개: Audio Lab, FX Guide V2, User Routing V2
4. **Resource Library**
   - Manuals / Scenes / References를 상태별 카드로 표시
   - 검증된 자료만 카드와 링크로 제공
5. **Interactive Practice**
   - FX와 Channel Lab은 기본 요약 상태
   - 사용자가 선택할 때만 상세 controls 표시
6. **Footer**
   - 공식 MIDAS reference와 배포·자료 상태 안내

---

## 5. Success Criteria

### 5.1 Definition of Done

- [ ] 승인된 wireframe과 동일한 정보 구조 구현
- [ ] 기존 검정/금색 MIDAS 시각 언어 유지
- [ ] Dark/Light 테마 모두 설계 token과 대비 기준 충족
- [ ] 최초 OS 설정 및 저장된 사용자 테마 선택이 올바르게 적용
- [ ] 검증된 Guide 5개, Scene 1개, Audio Lab 및 JS 보존
- [ ] 제공되는 모든 자료 링크의 실제 파일 존재
- [ ] 360px부터 1440px까지 주요 breakpoint 검증
- [ ] 키보드만으로 navigation, filters, Lab tabs 사용 가능
- [ ] `npm ci` 및 `npm run build` 성공
- [ ] `scripts/check-m32-pages.mjs` 통과
- [ ] 로컬 정적 서버에서 Hub와 내부 링크 HTTP 200
- [ ] PR CI 성공 후에만 main 병합
- [ ] 배포 후 실제 Pages URL 검증

### 5.2 Quality Criteria

- [ ] HTML title과 heading hierarchy 유효
- [ ] 내부 링크 누락 0건
- [ ] Console 초기화 오류 0건
- [ ] 360px viewport 가로 overflow 0건
- [ ] 주요 클릭/터치 target 최소 44×44px 목표
- [ ] 기존 Audio Lab ORIGINAL/PROCESSED graph 변경 없음

---

## 6. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Hub HTML이 압축 asset에서 다시 생성되어 레이아웃 변경이 덮어써짐 | High | High | `public/m32/index.html` 수정 후 `index.html.gz.b64`를 함께 갱신하고 재빌드 |
| 레이아웃 변경 중 Audio Lab inline script 또는 기존 JS 손상 | High | Medium | UI와 DSP 변경 범위를 분리하고 JS syntax 및 source graph 검사 |
| 모바일에서 Lab controls가 지나치게 길어짐 | Medium | High | 기본 접힘, progressive disclosure, 1열 control layout 적용 |
| 통계 숫자와 실제 배포 파일 불일치 | Medium | Medium | 검증된 파일 manifest 또는 build-time 계산 방식 검토 |
| 검증되지 않은 자료가 링크로 노출됨 | High | Low | 배포 전 자산 복원 및 link checker 검사 유지 |
| 과도한 시각 변경으로 기존 MIDAS 정체성 약화 | Medium | Medium | 색상 token과 검정/금색 기조 고정, 구조·간격 중심 개선 |
| Light 모드에서 금색 accent와 본문 대비가 부족함 | High | Medium | Light 전용 gold-dark token과 WCAG 대비 검사 적용 |
| 초기 렌더링에서 잘못된 테마가 잠깐 표시됨 | Medium | Medium | `<head>`의 작은 초기화 script로 저장값/OS 설정을 CSS 전에 적용 |

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Selected |
|-------|-----------------|:--------:|
| **Starter** | 정적 HTML/CSS/JavaScript, GitHub Pages | ✓ |
| **Dynamic** | BaaS 및 서버 데이터 연동 | - |
| **Enterprise** | Microservices 및 분산 인프라 | - |

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Rendering | 기존 정적 HTML / React 전환 | 기존 정적 HTML | 배포와 Audio Lab 구조를 보존하고 변경 위험 최소화 |
| Styling | 기존 inline CSS / 외부 CSS 분리 | Design 단계에서 비교 후 결정 | 유지보수성과 asset 복원 흐름을 함께 검토해야 함 |
| Navigation | 다중 페이지 / anchor navigation | Hub anchor + 기존 Audio Lab 별도 페이지 | Project Pages 상대경로와 단순 사용 흐름 유지 |
| Lab visibility | 항상 펼침 / 접기·탭 | 요약 후 사용자 선택 시 펼침 | 초기 정보 밀도와 모바일 스크롤 감소 |
| Asset status | 카드 하드코딩 / manifest 기반 | manifest 기반 우선 검토 | 통계와 복원 상태 불일치 방지 |
| Theme | CSS media query만 / `data-theme` + 저장 | `data-theme` + OS fallback | 사용자 선택을 유지하면서 최초 방문은 시스템 설정 존중 |

---

## 8. Delivery Sequence

1. **Design**: desktop/mobile wireframe, component states, breakpoint 정의
2. **Do — Structure**: semantic sections, navigation, quick access, resource hierarchy 구현
3. **Do — Responsive**: grid, spacing, typography, touch controls 적용
4. **Do — Accessibility**: focus, keyboard, contrast, reduced motion 점검
5. **Check**: design 대비 gap analysis와 기존 기능 회귀 검사
6. **Act**: 90% 미만 gap 보완
7. **Report/Deploy**: build, PR CI, Pages 배포 및 실제 URL 검증

---

## 9. Next Steps

1. [ ] 본 Plan의 정보 구조와 변경 범위 사용자 승인
2. [ ] `m32-pages-layout-refresh.design.md`에 desktop/mobile wireframe 작성
3. [ ] 기존 페이지 screenshot 또는 viewport 기준선 확보
4. [ ] 구현 전 Audio Lab 회귀 검사 항목 고정

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-09-01 | Initial layout refresh plan | Codex |
