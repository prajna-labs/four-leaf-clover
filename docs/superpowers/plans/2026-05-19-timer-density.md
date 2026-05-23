# §6.6 플레이 타이머 + §6.7 뷰포트 밀도 보정 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** FieldScene에 들판 단위 타이머(상단 중앙 표시 + 발견 토스트 기록)와 뷰포트 면적 비례 클로버 밀도 보정을 추가한다.

**Architecture:** 두 기능 모두 `FieldScene.ts` 한 파일만 수정한다. 타이머는 Phaser `time.addEvent` 100ms 루프로 구동하고, 밀도는 순수 함수 `computeCloverCount`로 분리해 테스트한다. 커밋은 §6.6, §6.7 분리.

**Tech Stack:** Phaser 3 (`time.addEvent`, `GameObjects.Text`), TypeScript, Vitest

---

## 파일 맵

| 파일 | 역할 |
|------|------|
| `client/src/scenes/FieldScene.ts` | 타이머 상태/HUD/로직 + `computeCloverCount` export |
| `client/src/scenes/FieldScene.test.ts` | `computeCloverCount` 단위 테스트 (신규) |

---

## Task 1: §6.6 플레이 타이머

**Files:**
- Modify: `client/src/scenes/FieldScene.ts`

> UI/연출이므로 단위 테스트 없이 수동 검증. CLAUDE.md 규칙 참조.

- [ ] **Step 1: 타이머 전용 private 필드 3개 추가**

  `FieldScene` 클래스의 기존 필드 선언부(`private clovers`, `private acceptingInput` 등) 아래에 추가:

  ```ts
  private timerText!: Phaser.GameObjects.Text;
  private fieldStartTime = 0;
  private timerEvent: Phaser.Time.TimerEvent | null = null;
  ```

- [ ] **Step 2: `create()` 재구성 — HUD 먼저, `spawnField()` 나중에**

  현재 `create()`의 첫 줄이 `this.spawnField()`인데, `timerText`가 초기화되기 전에 spawnField가 호출되면 타이머 루프에서 참조 오류가 발생한다. HUD 전체를 먼저 초기화한 뒤 `spawnField()`를 호출하도록 순서를 변경한다.

  `create()` 전체를 다음으로 교체:

  ```ts
  create(): void {
    const btn = this.add
      .text(20, 20, "새 들판", HUD_TEXT_STYLE)
      .setInteractive({ useHandCursor: true })
      .setDepth(100);
    btn.on("pointerdown", () => this.spawnField());

    this.counterText = this.add
      .text(this.scale.width - 20, 20, this.counterLabel(), HUD_TEXT_STYLE)
      .setOrigin(1, 0)
      .setDepth(100);

    this.timerText = this.add
      .text(this.scale.width / 2, 20, "0.0초", HUD_TEXT_STYLE)
      .setOrigin(0.5, 0)
      .setDepth(100);

    this.spawnField();

    this.scale.on("resize", () => {
      this.spawnField();
      this.counterText.setPosition(this.scale.width - 20, 20);
      this.timerText.setX(this.scale.width / 2);
    });
  }
  ```

- [ ] **Step 3: `spawnField()` 앞부분에 타이머 시작 로직 추가**

  `spawnField()` 내 `for (const c of this.clovers) c.destroy();` 바로 다음 줄에 삽입:

  ```ts
  if (this.timerEvent) {
    this.timerEvent.remove();
    this.timerEvent = null;
  }
  this.fieldStartTime = this.time.now;
  this.timerText.setText("0.0초");
  this.timerEvent = this.time.addEvent({
    delay: 100,
    loop: true,
    callback: () => {
      const elapsed = (this.time.now - this.fieldStartTime) / 1000;
      this.timerText.setText(elapsed.toFixed(1) + "초");
    },
  });
  ```

- [ ] **Step 4: `onFound()` — 타이머 중단 + 토스트에 경과 시간 삽입**

  `onFound()` 전체를 다음으로 교체:

  ```ts
  private onFound(clover: Clover): void {
    this.acceptingInput = false;
    this.foundCount += 1;
    this.counterText.setText(this.counterLabel());

    const elapsed = (this.time.now - this.fieldStartTime) / 1000;
    if (this.timerEvent) {
      this.timerEvent.remove();
      this.timerEvent = null;
    }

    this.tweens.add({
      targets: this.counterText,
      scale: 1.25,
      duration: 130,
      yoyo: true,
      ease: "Back.Out",
    });

    const baseScale = clover.scale;
    this.tweens.add({
      targets: clover,
      scale: baseScale * 1.6,
      duration: 180,
      ease: "Back.Out",
      yoyo: true,
    });

    const { width, height } = this.scale;
    const toast = this.add
      .text(width / 2, height / 2, `찾았다! (${elapsed.toFixed(1)}초)`, {
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "44px",
        color: "#ffffff",
        stroke: "#1a3d1f",
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(200);

    this.tweens.add({
      targets: toast,
      alpha: 1,
      scale: { from: 0.8, to: 1.1 },
      duration: 180,
      ease: "Back.Out",
    });

    this.time.delayedCall(NEXT_FIELD_DELAY_MS, () => {
      toast.destroy();
      this.spawnField();
    });
  }
  ```

- [ ] **Step 5: 타입 체크**

  ```bash
  cd client && pnpm typecheck
  ```

  Expected: 오류 없음

- [ ] **Step 6: 수동 검증**

  ```bash
  cd client && pnpm dev
  ```

  확인 사항:
  - 상단 중앙에 타이머 표시 ("0.0초"부터 시작)
  - 0.1초마다 증가
  - 네잎클로버 발견 시 토스트에 "(N.N초)" 표시
  - 새 들판 생성 시 타이머 리셋
  - 오답 탭 시 타이머 계속 진행
  - 화면 리사이즈 시 타이머 X 위치 중앙 유지

- [ ] **Step 7: 커밋**

  ```bash
  git add client/src/scenes/FieldScene.ts
  git commit -m "Phase 1 §6.6 — 들판 타이머 (상단 중앙 표시 + 발견 토스트 기록)"
  ```

---

## Task 2: §6.7 뷰포트별 클로버 밀도 보정

**Files:**
- Modify: `client/src/scenes/FieldScene.ts`
- Create: `client/src/scenes/FieldScene.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

  `client/src/scenes/FieldScene.test.ts` 신규 생성:

  ```ts
  import { describe, it, expect } from "vitest";
  import { computeCloverCount } from "./FieldScene";

  describe("computeCloverCount", () => {
    it("기준 모바일 해상도(375×812)에서 60을 반환한다", () => {
      expect(computeCloverCount(375, 812)).toBe(60);
    });

    it("아주 작은 화면에서 MIN(40) 이하로 내려가지 않는다", () => {
      expect(computeCloverCount(200, 300)).toBe(40);
    });

    it("큰 화면에서 MAX(120)을 초과하지 않는다", () => {
      expect(computeCloverCount(1920, 1080)).toBe(120);
    });

    it("기준보다 큰 모바일 화면에서 비례해서 증가한다", () => {
      expect(computeCloverCount(430, 932)).toBe(78);
    });
  });
  ```

- [ ] **Step 2: 테스트 실행 → 실패 확인**

  ```bash
  cd client && pnpm test:run
  ```

  Expected: `computeCloverCount` is not exported 오류로 FAIL

- [ ] **Step 3: `FieldScene.ts` 상단 상수 교체 + `computeCloverCount` 추가**

  기존 `const CLOVER_COUNT = 60;` 줄을 다음으로 교체:

  ```ts
  const BASE_AREA = 375 * 812;
  const BASE_COUNT = 60;
  const DENSITY_MIN = 40;
  const DENSITY_MAX = 120;

  export function computeCloverCount(width: number, height: number): number {
    const area = width * height;
    const raw = Math.floor((area / BASE_AREA) * BASE_COUNT);
    return Math.max(DENSITY_MIN, Math.min(DENSITY_MAX, raw));
  }
  ```

- [ ] **Step 4: `spawnField()` 내 `generateField()` 호출 수정**

  `spawnField()` 안의 `const { width, height } = this.scale;` 다음 줄에 `computeCloverCount` 호출을 추가하고, `generateField` 호출의 `count` 값을 교체:

  ```ts
  const { width, height } = this.scale;                    // 기존 줄
  const count = computeCloverCount(width, height);          // 추가
  const field = generateField({
    width: width - FIELD_MARGIN * 2,
    height: height - FIELD_MARGIN * 2,
    count,                                                  // CLOVER_COUNT → count
    seed: Math.floor(Math.random() * 1e9),
  });
  ```

- [ ] **Step 5: 테스트 실행 → 통과 확인**

  ```bash
  cd client && pnpm test:run
  ```

  Expected: 모든 테스트 PASS (FieldGenerator 기존 테스트 포함)

- [ ] **Step 6: 타입 체크**

  ```bash
  cd client && pnpm typecheck
  ```

  Expected: 오류 없음

- [ ] **Step 7: 수동 검증**

  ```bash
  cd client && pnpm dev
  ```

  확인 사항:
  - 브라우저 창을 좁혔다 넓혔다 하면서 새 들판 생성 시 클로버 수 변화 확인
  - 모바일 크기(375px 폭)에서 약 60개, 넓은 화면에서 약 120개(상한)

- [ ] **Step 8: 커밋**

  ```bash
  git add client/src/scenes/FieldScene.ts client/src/scenes/FieldScene.test.ts
  git commit -m "Phase 1 §6.7 — 뷰포트 밀도 보정 (픽셀 면적 비례 + 상한 120)"
  ```
