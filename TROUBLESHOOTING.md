# 트러블슈팅 기록

> 작업 중 발생한 **비자명한 문제**와 그 해결 과정.
> 코드만 봐서는 원인을 알 수 없는 것, 진단에 시간이 들었던 것 위주로 기록한다.
> 자명한 문제(오타, 단순 누락)나 커밋 메시지 한 줄로 충분한 것은 기록하지 않는다.
> 미해결 항목은 *왜 그랬는지*를 명시한다.
>
> **시간 역순** — 최신이 위.

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
