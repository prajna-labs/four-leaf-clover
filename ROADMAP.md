# 개발 로드맵

> Phase별 상세 작업 목록. 큰 그림(컨셉/디자인/타겟/기술 스택)은 [PROJECT.md](PROJECT.md).
> 외부 input·미결 아이디어는 [BACKLOG.md](BACKLOG.md), 기술 문제 이력은 [TROUBLESHOOTING.md](TROUBLESHOOTING.md), 갈림길 결정은 [DECISIONS.md](DECISIONS.md).
>
> **상태**: ✅ 완료 (커밋 해시) / ⏳ 진행 중 / 📋 예정
> Phase 기간은 추정치.

---

## Phase 1 — 코어 루프 검증 (1~2주)

**검증 질문**: *"찾는 행위 자체가 재밌는가?"*

**아트**: SVG 기하학 도형 (타원 3~4개 회전 배치). 손그림 ❌ — Phase 2부터.

### 산출물

- 한 화면, 세잎클로버 50~100개 + 네잎클로버 1개
- 탭 감지 및 정/오답 피드백
- 새 들판 생성 (자동 + 수동 버튼)
- 브라우저에서 플레이 가능

### 작업 단위

- ✅ §6.1 부트스트랩 (Vite + TS + Phaser + Capacitor) — `c6263e1`
- ✅ §6.2 Clover 엔티티 (SVG 함수 + Container 클래스) — `c0a481b`, refactor `15103d1`
- ✅ §6.3 FieldGenerator (TDD) — `a6fc251`
- ✅ §6.4 FieldScene (탭 입력 + 정/오답 피드백) — `0d06864`
- ✅ §6.5 발견 카운터 (세션 누적) — `7968075`
- 📋 §6.6 플레이 타이머 표시 *(from [BACKLOG](BACKLOG.md) 1차 #1)*
- 📋 §6.7 뷰포트별 클로버 밀도 보정 — PC/모바일 균형 *(from [BACKLOG](BACKLOG.md) 1차 #2)*

### 검증 방법

- 5~10명 플레이테스트 후 관찰
- ✅ 1차 플레이테스트 완료 (2026-05-19) — 결과는 [BACKLOG.md](BACKLOG.md) 세션 참조

### Phase 1 완료 기준

§6.1~§6.7 완료 → 코어 루프 검증 가능. 친구들에게 보낼 수 있는 데모.

---

## Phase 2 — 감각 완성도 (2~3주)

**검증 질문**: *"만질 맛이 나는가?"*

### 산출물

- 손그림 에셋 (세잎/네잎 클로버, 배경 텍스처)
- 햅틱 + 사운드 피드백
- 카메라/들판 자연스러운 스크롤
- 발견 시 만족스러운 애니메이션

### 작업 단위

- 📋 손그림 에셋 도입 — 레퍼런스: [references/art/](references/art/) *(from [BACKLOG](BACKLOG.md) 1차 #3)*
- 📋 햅틱 피드백 (`@capacitor/haptics`)
- 📋 사운드 디렉션 결정 + 적용 — [PROJECT.md §2.4 미결](PROJECT.md)
- 📋 발견 시 만족 애니메이션 (현 Phase 1 단순 펄스 → 진한 연출)
- 📋 클로버 드래그 물리 연출 (스와이프로 밀고 가려진 클로버 드러내기) *(from [BACKLOG](BACKLOG.md) 1차 #4)*
- 📋 Retina/HiDPI 처리 재검토 — [DECISIONS.md](DECISIONS.md) "(C) 고해상도 손그림 에셋으로 자연 해결" 우선 시도

---

## Phase 3 — 컬렉션 & 진행감 (3~4주)

**검증 질문**: *"다시 돌아오고 싶은가?"*

### 산출물

- 컬렉션 갤러리 화면
- 씬 전환 (풀밭 / 산 / 꽃밭)
- 일일 발견 기록
- 로컬 영속성

### 작업 단위

- 📋 컬렉션 갤러리 (CollectionScene)
- 📋 씬 시스템 (풀밭 / 산 / 꽃밭 3종)
- 📋 영속성 (Capacitor Preferences 또는 SQLite — [PROJECT.md §2.4 미결](PROJECT.md))
- 📋 일일 발견 기록
- 📋 밀도 기반 난이도 모드 *(from [BACKLOG](BACKLOG.md) 1차 #5)* — [PROJECT.md §2.4 "난이도 모드 도입"](PROJECT.md) 시점
- 📋 PC 맵 스크롤 탐색 + 모바일 대응 *(from [BACKLOG](BACKLOG.md) 1차 #6, #8)*

---

## Phase 4 — 출시 준비 & BM (4주~)

### 산출물

- 네잎클로버 위치 힌트 (IAP 또는 광고 보상)
- 시즌/이벤트 시스템 (크리스마스, 봄 등)
- 푸시 알림
- iOS/Android 빌드 & 스토어 등록

### 작업 단위

- 📋 BM 구체화 — [PROJECT.md §2.4 미결](PROJECT.md)
- 📋 위치 힌트 IAP 또는 광고 보상 메커닉
- 📋 시즌/이벤트 시스템 (예: 크리스마스 — 삼색 세잎 사이의 삼색 네잎)
- 📋 푸시 알림
- 📋 iOS/Android 빌드 — Capacitor 네이티브 플랫폼 추가 시점 ([TROUBLESHOOTING.md](TROUBLESHOOTING.md) pnpm + CocoaPods 항목 확인)
- 📋 스토어 등록

---

## Phase 5 (post-MVP) — 모드 확장

**검토 시점**: Phase 4 진입 전, 또는 출시 후 안정화 단계.

### 작업 단위

- 📋 무한 모드 (넓은 맵 + 클로버 무한 생성, 유한 모드와 병렬) *(from [BACKLOG](BACKLOG.md) 1차 #7)* — Phase 4 진입 전 우선순위 재평가
