# 트러블슈팅 기록

> 작업 중 발생한 **비자명한 문제**와 그 해결 과정.
> 코드만 봐서는 원인을 알 수 없는 것, 진단에 시간이 들었던 것 위주로 기록한다.
> 자명한 문제(오타, 단순 누락)나 커밋 메시지 한 줄로 충분한 것은 기록하지 않는다.
> 미해결 항목은 *왜 그랬는지*를 명시한다.
>
> **시간 역순** — 최신이 위.

---

## 2026-05-17 — Retina/HiDPI 디스플레이에서 저해상도 렌더링 (Phase 2로 deferred)

**증상**: macOS Retina(devicePixelRatio=2)에서 클로버 테두리에 계단 현상, 텍스트("새 들판" 버튼)가 흐릿함.

**원인**: Phaser 3는 기본적으로 canvas의 internal pixel buffer 크기를 CSS 크기와 동일하게 설정. DPR=2 디스플레이에선 1x로 렌더한 캔버스를 브라우저가 2x로 늘려 표시 → 흐림. Phaser 3.50에서 `resolution` config 옵션이 제거되어 자동 해결 불가.

**시도 가능한 해법** (현재 미적용):
- **(A) Custom DPR 패치**: game init 후 `canvas.width/height = cssSize * dpr` 수동 설정 + `scale.resize` 이벤트 훅. 동작하면 즉시 효과, 단 Phaser ScaleManager와 충돌 가능.
- **(B) 좌표계를 physical pixel로 전환**: `width: innerWidth * dpr`, `zoom: 1/dpr`. 모든 상수(TAP_RADIUS, font 등)에 dpr 스케일 어프 필요. 큰 리팩터.
- **(C) Phase 2에서 손그림 에셋 도입 시 고해상도 텍스처로 자연 해결**: 코드 변경 최소.

**결정**: (C)를 1순위로 두고 Phase 2 진입 시 재검토. 결정 컨텍스트 → [DECISIONS.md](DECISIONS.md).

**관련**: PROJECT.md Phase 2 ("감각 완성도")

---

## 2026-05-17 — Container hit area가 회전에 따라 다른 분면으로 어긋남

**증상**: FieldScene 클로버 탭 시, 어떤 클로버는 1분면, 어떤 클로버는 3분면을 클릭해야 인식. 클로버 영역 밖을 클릭해야 인식되는 경우도.

**원인**: Phaser Container의 hit detection은 `localPoint + displayOrigin`을 hit area shape와 대조함. Container origin이 기본 (0.5, 0.5)이고 `setSize(56, 56)`이면 displayOrigin = (28, 28). 따라서 `Circle(0, 0, 28)`은 사실 컨테이너 위치에서 (-28, -28) 오프셋된 곳에 그려진 원. **Container rotation이 적용되면 이 오프셋도 회전**해서, 클로버 회전값에 따라 hit area가 1/2/3/4분면 어디로든 어긋남.

**해결**: Circle 중심을 size box 중심으로 이동 — `Circle(0, 0, R)` → `Circle(R, R, R)`. 회전/스케일과 무관하게 시각 중심에 정렬.

**교훈**: Phaser Container에 custom hit area shape를 줄 때 shape 좌표는 *size box의 좌상단 기준*. 시각 중심에 맞추려면 `(width/2, height/2)`로 이동시킬 것. (Sprite는 origin 처리가 달라서 같은 함정 없음.)

**관련 커밋**: `0d06864` (Phase 1 §6.4 — FieldScene)

---

## 2026-05-16 — Phaser import가 node 테스트 환경에서 실패

**증상**: `vitest run` 시 `ReferenceError: window is not defined` (Phaser의 `OS.js` 모듈 init 단계).

**원인**: Vitest가 `Clover.test.ts` → `Clover.ts` → `import Phaser from "phaser"` 체인을 따라가는데, Phaser는 import 시점에 `window` / `navigator` / `canvas`를 즉시 참조함. node 환경엔 이 globals이 없음.

**시도 1 — happy-dom 환경**: `pnpm add -D happy-dom` + `environment: "happy-dom"`. `window`는 해결됐지만 `Cannot set properties of null (setting 'fillStyle')`로 또 죽음 (happy-dom이 canvas API를 충분히 구현하지 않음).

**해결**: 순수 SVG 함수(`generateCloverSVG`, 타입, 형상 상수)를 [client/src/entities/cloverSvg.ts](client/src/entities/cloverSvg.ts)로 분리. 테스트는 `cloverSvg.ts`만 import하므로 Phaser 모듈 그래프가 트리거되지 않음. happy-dom 제거.

**교훈**: CLAUDE.md의 "순수 로직만 단위 테스트" 원칙을 따르려면 순수 로직이 *실제로 순수해야* 함 — Phaser 의존이 transitive하게 끌려오면 안 됨. 이후 새 entity 추가 시도 같은 분리 패턴 유지.

**관련 커밋**: `15103d1`

---

## 2026-05-16 — Vitest 4 ↔ Vite 5 peer dep 충돌

**증상**: `pnpm add -D vitest` 후 `unmet peer vite@"^6.0.0 || ^7.0.0 || ^8.0.0": found 5.4.21` 경고.

**원인**: Vitest 4가 Vite 6+ peer를 요구하는데 부트스트랩 시점에 Vite 5를 설치했음.

**해결**: Vite 5 → 8 업그레이드 (Vitest 4 지원 범위 내 최신, Phaser/플러그인 호환성 무관). 부가 효과로 Rolldown 백엔드 도입되어 build 시간 ~7배 단축.

**대안 비교**: Vitest를 v3로 다운그레이드(Vite 5 유지)도 가능했으나, 부트스트랩 직후라 churn이 작고 v4가 장기 유지에 유리해서 업그레이드 선택.

**관련 커밋**: `8c17740`

---

## 2026-05-16 — pnpm 10에서 esbuild postinstall 차단

**증상**: `pnpm install` 시 `Ignored build scripts: esbuild@0.21.5` 경고. 매 설치마다 반복 노출.

**원인**: pnpm 10부터 보안상 postinstall 스크립트를 기본 차단. esbuild는 신뢰할 수 있는 빌드 도구지만 명시적 허용 필요.

**해결**: `client/package.json`에 `pnpm.onlyBuiltDependencies: ["esbuild"]` 추가. (당장은 esbuild가 optionalDependencies로 플랫폼별 바이너리를 받아서 빌드 자체는 동작했지만, 경고 제거 및 향후 신규 환경에서의 동작 보장 위해 명시 허용.)

**관련 커밋**: `d4df67b`
