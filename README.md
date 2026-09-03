# MIACC Score & M32 Worship Tools

MIACC 예배 준비와 FOH 운영을 돕는 웹 도구 모음입니다. 하나의 메인 페이지에서 **악보 콘티 작성 도구**와 **MIDAS M32 운영 Hub**로 이동할 수 있습니다.

## 바로가기

- 메인: <https://namyunmong.github.io/MIACC_Score/>
- 악보 콘티 작성: <https://namyunmong.github.io/MIACC_Score/score.html>
- M32 Output Hub: <https://namyunmong.github.io/MIACC_Score/m32/>
- M32 Audio Lab: <https://namyunmong.github.io/MIACC_Score/m32/audio-lab.html>

## 주요 기능

### 악보 콘티 작성

- 여러 곡을 페이지 단위로 추가 및 관리
- 날짜, 곡명, Key 입력
- 악보 이미지 업로드 및 배치 조정
- 섹션별 연주 요청 사항 작성
- A4 미리보기와 브라우저 인쇄 기능을 이용한 PDF 저장

업로드한 악보 이미지는 브라우저 내부에서 처리되며, 별도의 서버나 데이터베이스로 전송하지 않습니다.

### M32 Output Hub

- 교회 예배 및 찬양팀용 M32 운영 매뉴얼
- Routing, P16, Scene, Matrix, RTA/GEQ 등을 다루는 Appendix
- FX Setup Guide V2
- 검증된 예배 Scene 파일 다운로드
- MIDAS 공식 사이트 연결
- Dark/Light 테마 및 모바일 레이아웃

### M32 Audio Lab

브라우저에서 오디오 파일 또는 마이크 입력을 사용해 다음 신호 처리 흐름을 연습할 수 있습니다.

```text
Source → Gate → EQ → Compressor → Channel Fader → Main
```

- Original/Processed 모니터 비교
- Gate, 4-band EQ, Compressor 실습
- FX Send/Return 신호 흐름 연습
- 시그널 라인과 각 모듈에서 Gate, EQ, Compressor, Reverb 독립 ON/OFF
- Post/Pre-Fader FX 비교와 FX 레벨 계산 및 연습 시나리오
- 입력 및 출력 레벨 시각화

> Audio Lab은 교육용 근사 시뮬레이션입니다. 실제 M32 DSP 알고리즘을 동일하게 복제한 에뮬레이터는 아닙니다.

## 기술 구성

- React 19
- TypeScript
- Vite 7
- Lucide React
- HTML, CSS, Web Audio API
- GitHub Actions 및 GitHub Pages

서버, 로그인, 데이터베이스가 없는 정적 웹 프로젝트입니다.

## 로컬 실행

### 요구 환경

- Node.js 22 권장
- npm

### 개발 서버

```bash
npm ci
npm run dev
```

Vite가 출력하는 로컬 주소를 브라우저에서 엽니다.

### 프로덕션 빌드

```bash
npm run build
```

빌드 결과는 `dist/`에 생성됩니다. 이 명령은 다음 작업을 순서대로 실행합니다.

1. `m32-pages-assets/`의 압축 자산 복원
2. TypeScript 검사
3. Vite 프로덕션 빌드
4. M32 Hub 내부 링크 검사
5. 메인, Score, M32 진입 경로 검사

### 빌드 결과 미리보기

```bash
npm run preview
```

## 주요 경로

```text
.
├─ index.html                  # 메인 선택 페이지
├─ score.html                  # 악보 콘티 작성 진입점
├─ src/
│  ├─ LandingPage.tsx          # 메인 포털
│  ├─ App.tsx                  # 콘티 작성 애플리케이션
│  └─ components/              # 콘티 입력 및 미리보기 컴포넌트
├─ public/m32/
│  ├─ index.html               # M32 Output Hub
│  ├─ audio-lab.html
│  └─ audio-lab.js
├─ m32-pages-assets/           # 배포용 M32 압축 원본
├─ scripts/
│  ├─ build-m32-pages.mjs      # M32 자산 복원
│  ├─ check-m32-pages.mjs      # M32 내부 링크 검사
│  └─ check-main-portal.mjs    # 주요 진입 경로 검사
└─ .github/workflows/deploy.yml
```

## M32 자산 관리

큰 HTML 및 Scene 파일은 gzip 압축 후 Base64 형식으로 `m32-pages-assets/`에 저장합니다.

지원 형식:

```text
filename.html.gz.b64
filename.html.gz.b64.000
filename.html.gz.b64.001
filename.html.gz.b64.003a
filename.html.gz.b64.003b
```

조각 파일은 숫자 순서로 결합하며, 같은 숫자에서는 `a`, `b`, `c` 순서로 처리합니다. 복원된 파일은 HTML/SCN 기본 형식과 gzip 무결성 검사를 통과해야 `public/m32/`에 생성됩니다.

### 검증된 운영 자료

Complete Reset Guide와 FOH Live Mixing Guide는 확보된 정상 원본을 배포용 압축 자산으로 전환하고 빌드 검증을 통과한 뒤 Hub에 연결합니다.

현재 FOH 운영 범위와 맞지 않는 StudioLive Reference 자료는 프로젝트에서 제거했습니다.

## 개별 검사 명령

```bash
npm run check:m32
npm run check:portal
```

- `check:m32`: M32 HTML의 내부 링크와 필수 기능 확인
- `check:portal`: 메인, Score, M32 진입 파일과 빌드 자산 확인

검사 중 하나라도 실패하면 종료 코드 `1`을 반환하여 GitHub Actions 배포를 중단합니다.

## 배포

`main` 브랜치에 푸시하면 GitHub Actions가 다음 과정으로 GitHub Pages를 배포합니다.

```text
Checkout → Node.js 22 → npm ci → npm run build → dist 업로드 → Pages 배포
```

Pull Request에서는 동일한 빌드를 실행해 배포 전에 오류를 확인하며, 실제 Pages 배포는 `main` 브랜치에서만 진행합니다.

## 작업 시 주의사항

- 기존 M32 Audio Lab과 정상 복원된 manual/scene 파일을 임의로 덮어쓰지 않습니다.
- 손상된 gzip/Base64 조각에 임의 데이터를 추가하지 않습니다.
- GitHub Project Pages 경로인 `/MIACC_Score/`를 고려합니다.
- `/m32/` 내부 문서는 가능한 상대경로를 사용합니다.
- 변경 후 반드시 `npm run build`를 실행합니다.

## 라이선스 및 자료 사용

MIDAS 제품명과 관련 상표는 각 권리자에게 귀속됩니다. 공식 매뉴얼은 임의 복제본보다 MIDAS 공식 자료 링크를 우선합니다. 저장소에 포함된 예배 운영 문서와 Scene 파일은 실제 장비에 적용하기 전에 현재 시스템의 Routing, Gain, Output 설정을 반드시 확인하세요.
