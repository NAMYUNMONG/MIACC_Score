# Unified M32 Audio Lab Plan

## 목적
M32 Audio Lab, FX Send/Return, Gate, 4-band EQ, Compressor 실습을 `audio-lab.html` 한 페이지로 통합하고 각 프로세서를 독립적으로 bypass할 수 있게 한다.

## 범위
- Hub의 중복 인라인 시뮬레이터 제거 및 통합 Lab 링크 제공
- 하나의 오디오 입력과 하나의 고정 처리 그래프 사용
- Gate, EQ, Compressor, Reverb 개별 ON/OFF
- Original/Processed 전체 비교 유지
- 파일 입력, 마이크, Loop, FX pre/post tap, meter, preset 보존
- Dark/Light 및 모바일 UI 보존

## 제외 범위
- MIDAS DSP의 bit-exact 복제
- M32Edit.exe 실행
- 오디오 파일 서버 업로드

## 완료 기준
- 네 프로세서가 각각 독립적으로 ON/OFF 된다.
- bypass 전환 시 source node를 disconnect하지 않는다.
- OFF 상태가 signal flow와 module UI에 표시된다.
- 기존 Original/Processed 모니터가 정상 유지된다.
- Hub에는 중복 시뮬레이터가 없고 통합 Lab 링크만 존재한다.
- 빌드, 정적 검사, 로컬 링크 검사를 통과한다.

## 위험과 대응
- 병렬 dry/wet 합산 시 레벨 증가: ON/OFF gain을 상호 배타적으로 전환
- Compressor bypass 시 makeup 잔존: OFF일 때 makeup을 unity로 고정
- Gate animation과 bypass 충돌: gate detector는 wet gain만 제어하고 bypass gain은 별도 관리
- FX OFF 후 잔향 tail: return bypass gain을 짧게 ramp하여 클릭을 방지
