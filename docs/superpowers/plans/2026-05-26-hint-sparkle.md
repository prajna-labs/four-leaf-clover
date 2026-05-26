# 힌트 버튼 + 별 파티클 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 힌트 버튼을 HUD 하단 중앙에 추가하고, 클릭 시 네잎클로버 주변으로 별 파티클(✦✧)이 희미하게 2초간 나타났다 사라지게 한다. 들판당 1회 사용 가능.

**Architecture:** `FieldScene.ts` 하나만 수정. `hintBtn`(Text)과 `hintUsed`(bool) 필드 추가. `showHint()` private 메서드가 파티클 8개를 생성하고 체인 tween(이동+페이드인 1초 → 페이드아웃 1초)으로 애니메이션. `spawnField()` 호출 시 버튼 상태 리셋.

**Tech Stack:** Phaser 3 (`tweens.add`, `GameObjects.Text`), TypeScript

---

## 파일 맵

| 파일 | 역할 |
|------|------|
| `client/src/scenes/FieldScene.ts` | 힌트 버튼 + 파티클 로직 전체 |

---

## Task 1: 힌트 버튼 + 별 파티클

**Files:**
- Modify: `client/src/scenes/FieldScene.ts`

> UI/연출이므로 단위 테스트 없음. 수동 검증.

- [ ] **Step 1: 상단 상수 블록에 파티클 상수 4개 추가**

  `const NEXT_FIELD_DELAY_MS = 600;` 줄 **위에** 삽입:

  ```ts
  const HINT_PARTICLE_COUNT = 8;
  const HINT_PARTICLE_ALPHA = 0.35;
  const HINT_PARTICLE_RADIUS_MIN = 50;
  const HINT_PARTICLE_RADIUS_MAX = 70;
  ```

- [ ] **Step 2: 클래스 필드 2개 추가**

  기존 `private fieldStartTime = 0;` 줄 아래에 추가:

  ```ts
  private hintBtn!: Phaser.GameObjects.Text;
  private hintUsed = false;
  ```

- [ ] **Step 3: `create()` — hintBtn 초기화 추가**

  기존 `this.spawnField();` 줄 **바로 위에** 삽입:

  ```ts
  this.hintBtn = this.add
    .text(this.scale.width / 2, this.scale.height - 20, "힌트", HUD_TEXT_STYLE)
    .setOrigin(0.5, 1)
    .setInteractive({ useHandCursor: true })
    .setDepth(100);
  this.hintBtn.on("pointerdown", () => this.showHint());
  ```

- [ ] **Step 4: `create()` — resize 핸들러에 hintBtn 위치 업데이트 추가**

  기존 resize 핸들러 내 `this.counterText.setPosition(...)` 줄 아래에 추가:

  ```ts
  this.hintBtn.setPosition(this.scale.width / 2, this.scale.height - 20);
  ```

  결과적으로 resize 핸들러 전체:

  ```ts
  this.scale.on("resize", () => {
    this.spawnField();
    this.counterText.setPosition(this.scale.width - 20, 20);
    this.hintBtn.setPosition(this.scale.width / 2, this.scale.height - 20);
  });
  ```

- [ ] **Step 5: `spawnField()` — 힌트 상태 리셋 추가**

  `this.fieldStartTime = this.time.now;` 줄 아래에 추가:

  ```ts
  this.hintUsed = false;
  this.hintBtn.setAlpha(1).setInteractive({ useHandCursor: true });
  ```

- [ ] **Step 6: `showHint()` private 메서드 신규 추가**

  `onMiss()` 메서드 **바로 앞**에 삽입:

  ```ts
  private showHint(): void {
    if (this.hintUsed) return;
    this.hintUsed = true;
    this.hintBtn.setAlpha(0.35).disableInteractive();

    const fourLeaf = this.clovers.find((c) => c.isFourLeaf());
    if (!fourLeaf) return;

    const chars = ["✦", "✧"];
    for (let i = 0; i < HINT_PARTICLE_COUNT; i++) {
      const angle =
        (i / HINT_PARTICLE_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const radius =
        HINT_PARTICLE_RADIUS_MIN +
        Math.random() * (HINT_PARTICLE_RADIUS_MAX - HINT_PARTICLE_RADIUS_MIN);
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius;
      const delay = Math.random() * 600;

      const particle = this.add
        .text(fourLeaf.x, fourLeaf.y, chars[i % 2], {
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: i % 2 === 0 ? "10px" : "9px",
          color: "#ffe87a",
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setDepth(150);

      this.tweens.add({
        targets: particle,
        x: fourLeaf.x + dx,
        y: fourLeaf.y + dy,
        alpha: HINT_PARTICLE_ALPHA,
        duration: 1000,
        delay,
        ease: "Sine.Out",
        onComplete: () => {
          this.tweens.add({
            targets: particle,
            alpha: 0,
            duration: 1000,
            ease: "Sine.In",
            onComplete: () => particle.destroy(),
          });
        },
      });
    }
  }
  ```

- [ ] **Step 7: 타입 체크**

  ```bash
  cd /Users/sangsu/Desktop/projects_new/four-leaf-clover/client && pnpm typecheck
  ```

  Expected: 오류 없음

- [ ] **Step 8: 수동 검증**

  ```bash
  cd /Users/sangsu/Desktop/projects_new/four-leaf-clover/client && pnpm dev
  ```

  확인 사항:
  - 하단 중앙에 "힌트" 버튼 표시됨
  - 버튼 클릭 시 ✦✧ 파티클이 네잎클로버 주변에서 나타났다 사라짐 (약 2초)
  - 파티클이 희미함 (너무 밝지 않음)
  - 버튼이 클릭 후 흐려지고 재클릭 불가
  - 새 들판 생성 시 버튼 다시 활성화
  - 네잎클로버 발견 후 새 들판에서도 버튼 활성 상태
  - 리사이즈 시 버튼 위치 하단 중앙 유지

- [ ] **Step 9: 커밋**

  ```bash
  git -C /Users/sangsu/Desktop/projects_new/four-leaf-clover add client/src/scenes/FieldScene.ts
  git -C /Users/sangsu/Desktop/projects_new/four-leaf-clover commit -m "힌트 버튼 + 별 파티클 (들판당 1회, 2초 희미하게)"
  ```
