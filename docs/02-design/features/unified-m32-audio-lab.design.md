# Unified M32 Audio Lab Design

## Audio Graph

```text
Source ─┬─> Original Gain ───────────────────────────────────────────────┐
        └─> Input Analyser                                              │
             ├─> Gate processor ─> Gate Wet ─┐                          │
             └────────────────────> Gate Dry ─┴─> Post Gate Analyser     │
                    ├─> EQ 1..4 ─> EQ Wet ─┐                            │
                    └────────────────> EQ Dry ─┴─> EQ Sum                │
                           ├─> Compressor ─> Comp Wet ─┐                 │
                           └────────────────> Comp Dry ─┴─> Post Comp     │
                                                └─> Makeup ─> Fader ─> Dry Main
                                                     └─> FX Send/Bus/Reverb/Return Bypass
Dry Main + FX Return ─> Main Analyser ─> Processed Gain ─> Master ─> Destination
```

## 상태
- `processorState = { gate, eq, comp, fx }`
- 모든 값 기본 ON
- 토글은 해당 dry/wet GainNode만 0/1로 전환
- UI 버튼은 `aria-pressed`, ON/OFF 텍스트, `.is-bypassed` module 상태를 동기화

## 동작 규칙
- Gate OFF: detector 계산은 유지하되 Gate Wet=0, Gate Dry=1
- EQ OFF: 필터 경로=0, flat dry 경로=1
- Comp OFF: compressor 경로=0, dry 경로=1, makeup=unity
- Reverb OFF: FX return path=0, dry main 유지
- Original monitor: 전체 processed output=0, source direct=1
- Processed monitor: source direct=0, processed output=1

## 테스트
- 필수 DOM ID와 네 bypass control 존재
- AudioContext graph에 네 dry/wet pair 존재
- source disconnect는 입력 종류 교체 시에만 사용
- 각 toggle의 `aria-pressed`와 signal node 상태 변경
- `npm run build` 및 내부 링크 검사
