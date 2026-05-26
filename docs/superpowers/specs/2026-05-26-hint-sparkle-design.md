# 설계 문서 — 힌트 버튼 + 별 파티클

**날짜**: 2026-05-26
**관련 Phase**: 1 (코어 루프 검증 — 추가 편의 기능)
**수정 파일**: `client/src/scenes/FieldScene.ts` 하나만

---

## 개요

어려워서 못 찾는 경우를 위한 선택적 힌트 기능. 힌트 버튼 클릭 시 네잎클로버 주변으로 별 파티클(✦✧)이 희미하게 2초간 나타났다 사라진다. 들판당 1회만 사용 가능.

---

## 섹션 1: HUD 버튼

**위치**: 하단 중앙
- `x = width / 2`, `y = height - 20`
- `setOrigin(0.5, 1)`
- depth 100

**스타일**: 기존 `HUD_TEXT_STYLE` 그대로.

**상태**:

| 상태 | alpha | interactive |
|------|-------|-------------|
| 활성 (기본) | `1.0` | `true` |
| 사용 후 비활성 | `0.35` | `false` |

**리셋 시점**: `spawnField()` 호출 시 alpha `1.0`, interactive `true`로 복원.

---

## 섹션 2: 별 파티클 효과

### 파라미터

| 항목 | 값 |
|------|----|
| 파티클 수 | 8개 |
| 문자 | `"✦"` / `"✧"` 교대 |
| 폰트 크기 | 10px (`"✦"`), 9px (`"✧"`) |
| 최대 alpha | `0.35` (희미하게) |
| 이동 반경 | 50~70px (random) |
| tween duration | `2000ms` |
| stagger delay | 파티클마다 `0~600ms` random |
| ease | `Sine.Out` |

### 동작 흐름

1. 힌트 버튼 클릭
2. `hintUsed = true`, 버튼 alpha `0.35`, `disableInteractive()`
3. `clovers.find(c => c.isFourLeaf())` 로 네잎클로버 위치 파악
4. 8개 `Phaser.GameObjects.Text` 생성 — 네잎클로버의 `(x, y)` 에서 시작
5. 각 파티클에 두 개의 체인 tween:
   - **1단계** (1000ms + delay): `x/y` 이동 + `alpha 0→0.35` (ease: Sine.Out)
   - **2단계** (1000ms): `alpha 0.35→0` (ease: Sine.In), 위치는 고정
6. 2단계 `onComplete` 콜백에서 Text 오브젝트 `destroy()`

### random 각도 계산

```ts
const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
const radius = 50 + Math.random() * 20;
const dx = Math.cos(angle) * radius;
const dy = Math.sin(angle) * radius;
```

---

## 섹션 3: FieldScene 통합

### 새 필드

```ts
private hintBtn!: Phaser.GameObjects.Text;
private hintUsed = false;
```

### 변경 메서드

**`create()`**:
- `hintBtn` 생성 (하단 중앙)
- `pointerdown` → `showHint()` 바인딩
- resize 핸들러에 `hintBtn.setPosition(width / 2, height - 20)` 추가

**`spawnField()`**:
- `hintUsed = false`
- `hintBtn.setAlpha(1).setInteractive({ useHandCursor: true })`

**`showHint()` (신규 private 메서드)**:
- 버튼 비활성화 + 8개 파티클 tween 실행

### 테스트

없음 — UI/연출 기능, 수동 검증.

---

## 커밋

`힌트 버튼 + 별 파티클 (들판당 1회, 2초 희미하게)`
