# Math For Dummy (초등 수학 학습 도구)

[![CD (Deploy to GitHub Pages)](https://github.com/WooMRhackerman/math-for-dummy/actions/workflows/deploy.yml/badge.svg)](https://github.com/WooMRhackerman/math-for-dummy/actions/workflows/deploy.yml)
[![CI (Quality & Tests)](https://github.com/WooMRhackerman/math-for-dummy/actions/workflows/ci.yml/badge.svg)](https://github.com/WooMRhackerman/math-for-dummy/actions/workflows/ci.yml)
![PWA Ready](https://img.shields.io/badge/PWA-100%25%20Offline-blue?logo=pwa)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8?logo=tailwindcss)
![KaTeX](https://img.shields.io/badge/KaTeX-Math%20Engine-319795)

> **Math For Dummy**는 2022 개정 교육과정 초등 1학년부터 6학년까지의 전 과정(12개 학기, 70개 단원)을 학습할 수 있는 **무서버(Serverless) 오프라인 우선 Progressive Web App (PWA)**입니다.

🔗 **라이브 웹앱 접속하기:** [https://woomrhackerman.github.io/math-for-dummy/](https://woomrhackerman.github.io/math-for-dummy/)

---

## ✨ 핵심 기능 (Key Features)

### 1. 2022 개정 초등 수학 전 단원 풀 커버리지 (70 Units)
- **1~6학년 12개 학기 덱:** 학년·학기별 교과서 진도에 완벽 대응하는 12개 전용 덱.
- **수학 5대 영역 분류:**
  - 🔵 **수와 연산** (33단원)
  - 🟢 **도형** (15단원)
  - 🟡 **측정** (10단원)
  - 🔴 **자료와 가능성** (7단원)
  - 🟣 **규칙성** (5단원)
- **KaTeX 수식 렌더링:** 모바일 및 태블릿 화면에서도 잘림 없는 반응형 수식 뷰어 (`overflow-x: auto;`).

### 2. 에빙하우스 망각곡선 기반 SM-2 SRS 학습 엔진
- **SuperMemo SM-2 알고리즘:** 정답률과 난이도(Again, Hard, Good, Easy)에 따라 복습 간격(Interval)과 난이도 계수(Ease Factor)를 실시간 자동 최적화.
- **3D 촉각 플립 카드:** 키보드 단축키(Space, 1~4) 및 터치 제스처를 지원하며 누적 레이아웃 이동(CLS)이 없습니다.
- **한국어 IME 가드:** 한글 음절 조합 중(`e.isComposing`) 오작동 방지 처리.

### 3. 무서버 클라우드 동기화 (Serverless GitHub REST DB)
- 별도의 백엔드 서버 없이 사용자의 GitHub 저장소(`data.json`)와 직접 통신하여 기기 간(데스크톱, iPad, 스마트폰) 학습 진행 상황을 완벽하게 동기화합니다.
- **UTF-8 안전 Base64 인코딩:** 한글 유니코드 손실 방지.
- **낙관적 락 & 충돌 방지:** 원격 `sha` 검증을 통한 409 Conflict 방지.
- 개인 토큰(PAT)은 브라우저 로컬 IndexedDB에만 암호화 보관됩니다.

### 4. OLED Black 다크 모드 & 모바일 최적화
- **OLED 최적화:** 초저전력 `#020617` 캔버스 및 순수 블랙 표면 테마.
- **터치 인체공학:** $44\times 44\text{px}$ 이상의 최소 터치 타겟과 `env(safe-area-inset-*)` 노치 지원.
- **어댑티브 PWA 아이콘:** 안드로이드 마스커블 아이콘 및 iOS 터치 아이콘 지원.

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 | 설명 |
| :--- | :--- | :--- |
| **Frontend Core** | React 18 + TypeScript + Vite | 컴포넌트 기반 고속 번들링 SPA |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/vite`) | 최신 CSS-first `@theme` 디자인 토큰 구성 |
| **Math Engine** | KaTeX | 오프라인 폰트 번들링 수식 렌더러 |
| **Storage** | `idb-keyval` (IndexedDB) | Safari 5MB 한계를 우회하는 로컬 영구 저장소 |
| **PWA & Cache** | `vite-plugin-pwa` (Workbox) | 서비스 워커 기반 완전 오프라인 구동 |
| **Icons** | `lucide-react` | 일관된 모던 벡터 아이콘 |
| **CI/CD** | GitHub Actions | 자동 품질 검증(CI) 및 Pages 배포(CD) |

---

## 🔄 CI/CD 자동화 파이프라인

본 저장소는 GitHub Actions를 통해 2단계 자동화 파이프라인을 운영합니다.

```
[ Git Push / Pull Request ]
          │
          ├──> [ CI: Quality & Tests ] (.github/workflows/ci.yml)
          │     ├── 1. TypeScript Strict Typecheck (npm run typecheck)
          │     ├── 2. Vitest Test Suite (14 Tests) (npm test)
          │     ├── 3. Curriculum Integrity Audit (70 Units) (npm run verify:curriculum)
          │     └── 4. Production Build Bundling (npm run build)
          │
          └──> [ CD: GitHub Pages Deployment ] (.github/workflows/deploy.yml)
                └── Runs on push to main (all CI checks pass -> deploy dist/ to Pages)
```

---

## 💻 로컬 개발 및 테스트

```bash
# 1. 의존성 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. TypeScript 타입 검사
npm run typecheck

# 4. 전체 단위 테스트 실행 (Vitest)
npm test

# 5. 초등 70단원 커리큘럼 무결성 감사
npm run verify:curriculum

# 6. 프로덕션 빌드
npm run build
```

---

## 📜 라이선스

Personal Educational Project — Math For Dummy.
