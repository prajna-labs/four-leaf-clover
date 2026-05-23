# 설계 문서 — §6.6 플레이 타이머 + §6.7 뷰포트 밀도 보정

**날짜**: 2026-05-19  
**Phase**: 1 — 코어 루프 검증  
**관련 ROADMAP**: §6.6, §6.7  
**커밋 단위**: §6.6, §6.7 분리

---

## §6.6 플레이 타이머

### 요구사항

- 들판 단위로 측정 — 새 들판 생성 시 리셋
- 탐색 중 상단 중앙에 초 단위(소수점 1자리)로 표시
- 네잎클로버 발견 시 토스트에 경과 시간 삽입 ("찾았다! (12.3초)")
- 오답(onMiss)은 타이머에 영향 없음

### 데이터

| 필드 | 타입 | 역할 |
|------|------|------|
| `fieldStartTime` | `number` | `spawnField()` 시점의 `this.time.now` |
| `timerEvent` | `Phaser.Time.TimerEvent \| null` | 100ms 루프 핸들 |
| `timerText` | `Phaser.GameObjects.Text` | 상단 중앙 HUD 텍스트 |

### 동작 흐름

1. `spawnField()` 호출
   - 기존 `timerEvent` destroy
   - `fieldStartTime = this.time.now`
   - `time.addEvent({ delay: 100, loop: true, callback: updateTimer })` 로 루프 시작
   - `timerText` "0.0초" 로 초기화

2. `updateTimer()` (100ms마다)
   - `elapsed = (this.time.now - fieldStartTime) / 1000`
   - `timerText.setText(elapsed.toFixed(1) + "초")`

3. `onFound()` 호출
   - `timerEvent.remove()` 로 루프 중단
   - `elapsed` 계산 → 토스트 문자열: `"찾았다! (${elapsed.toFixed(1)}초)"`

### UI

- 위치: `x = width / 2`, `y = 20`, `setOrigin(0.5, 0)`
- 스타일: 기존 `HUD_TEXT_STYLE` 그대로
- 리사이즈 시: `timerText.setX(width / 2)` 추가

---

## §6.7 뷰포트별 클로버 밀도 보정

### 요구사항

- PC/모바일 어느 기기에서도 비슷한 밀도 느낌
- 단순 비례 시 대형 화면에서 클로버 수가 폭발하지 않도록 상한 캡

### 계산식

```
BASE_AREA  = 375 * 812   // 기준 모바일 해상도 ≈ 304,500 px²
BASE_COUNT = 60           // 기준 클로버 수
MIN        = 40
MAX        = 120

count = clamp(floor(width * height / BASE_AREA * BASE_COUNT), MIN, MAX)
```

### 함수

```ts
// FieldScene 내부 유틸 (private 메서드 또는 모듈 상단 순수 함수)
function computeCloverCount(width: number, height: number): number {
  const area = width * height;
  const raw = Math.floor((area / BASE_AREA) * BASE_COUNT);
  return Math.max(MIN, Math.min(MAX, raw));
}
```

### 적용

- 기존 `const CLOVER_COUNT = 60` 상수 제거
- `spawnField()` 내 `generateField()` 호출 직전에 `computeCloverCount(width, height)` 호출
- `BASE_AREA`, `BASE_COUNT`, `MIN`, `MAX` 는 모듈 상단 상수로 선언

### 예상 결과

| 기기 | 해상도 | 예상 클로버 수 |
|------|--------|---------------|
| 소형 모바일 | 375×667 | 49 |
| 기준 모바일 | 375×812 | 60 |
| 대형 모바일 | 430×932 | 78 |
| 태블릿 | 768×1024 | 154 → **120** (캡) |
| PC | 1440×900 | 255 → **120** (캡) |

---

## 커밋 순서

1. `§6.6 — 들판 타이머 (상단 중앙 표시 + 발견 토스트 기록)`
2. `§6.7 — 뷰포트 밀도 보정 (픽셀 면적 비례 + 상한 120)`
