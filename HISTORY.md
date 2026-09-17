# Work History & Changelog — Math For Dummy

> **Agent Maintenance Rule:**
> - Record all completed tasks and modifications in reverse-chronological order (newest first).
> - Keep this file concise and strictly **under 300 lines**.
> - When the file exceeds 280 lines, prune the oldest entries at the bottom while preserving active milestone summaries.

---

### [2026-09-17] Full Elementary Curriculum Expansion (12 Semesters, 70 Units)
- **Goal:** Complete comprehensive coverage of Korean elementary mathematics (2022 개정 초등 1학년~6학년 전 과정) across 12 distinct semester decks.
- **Key Changes:**
  - Designed and populated `src/data/curriculum-seed.json` with 70 flashcards spanning 70 distinct official units:
    - Grade 1 (Sem 1 & 2): 10 units (Numbers to 100, shapes, clock/rules, basic addition/subtraction).
    - Grade 2 (Sem 1 & 2): 12 units (3 & 4-digit numbers, shapes, measurement, multiplication tables, data tables).
    - Grade 3 (Sem 1 & 2): 12 units (Fractions, decimals, plane figures, division, capacity & weight, circle).
    - Grade 4 (Sem 1 & 2): 12 units (Large numbers, angles, figure transformations, bar/line graphs, polygons).
    - Grade 5 (Sem 1 & 2): 12 units (Mixed operations, factors & multiples, fraction/decimal ops, perimeter & area).
    - Grade 6 (Sem 1 & 2): 12 units (Fraction/decimal division, ratio & proportion, prism/cylinder volume & surface area).
  - Maintained complete 5-domain mathematical balance: 수와 연산 (33), 도형 (15), 측정 (10), 자료와 가능성 (7), 규칙성 (5).
  - Updated `src/components/DeckList.tsx` badge to display `{deck.grade}학년 {deck.semester}학기`.
  - Built curriculum verification script `.agents/skills/1-curriculum-curator/scripts/verify-curriculum.ts`.
  - Updated `tests/curriculum.test.ts` to assert 12 semester decks, 70 distinct units, 5-domain distribution, and KaTeX delimiter pairing.
- **Verification:** All 14 automated unit tests passed (`vitest run`). Curriculum audit script verified 100% coverage. Production build (`npm run build`) succeeded without warnings or errors.

---

### [2026-09-17] Android/iOS PWA Adaptive App Icon & Favicon
- **Goal:** Replace placeholder plain blue icons with a custom, high-contrast, modern mathematical app icon for Android adaptive launchers and iOS touch homescreens.
- **Key Changes:**
  - Designed vector-aesthetic icon featuring a bold white Sigma ($\sum$), gold point, and multiplication ($\times$) accent on a royal blue to indigo gradient.
  - Generated and exported high-resolution PNG assets:
    - `public/icon-512.png` ($512 \times 512\text{px}$)
    - `public/icon-192.png` ($192 \times 192\text{px}$)
    - `public/apple-touch-icon.png` ($180 \times 180\text{px}$)
    - `public/favicon.ico` ($48 \times 48\text{px}$)
  - Updated `vite.config.ts` to register both `"purpose": "any"` and `"purpose": "maskable"` manifest icon entries.
  - Updated `index.html` to link `<link rel="icon" href="./favicon.ico" />`.
- **Verification:** All 12 unit tests passed. Committed and pushed to `main` (`f74fff4`).

---

### [2026-09-17] Dark & OLED Black Theme Adaptation
- **Goal:** Provide a full deep black night mode for comfortable studying on OLED devices (iPad, iPhone, desktop) with high-contrast math formula rendering.
- **Key Changes:**
  - Added `@custom-variant dark (&:where(.dark, .dark *));` to `src/index.css`.
  - Added KaTeX dark mode rules ensuring fractions, symbols, and roots render in crisp `#f8fafc`.
  - Added `Theme = 'light' | 'dark' | 'system'` to `src/types/index.ts` and persistence to `src/services/storage.ts`.
  - Added ☀️ / 🌙 toggle in `src/components/Header.tsx` and 3-way selector in `src/components/SettingsModal.tsx`.
  - Adapted `StudyCard.tsx`, `DeckList.tsx`, and `App.tsx` with Deep Slate 950 canvas (`#020617`) and Slate 900 surfaces.
  - Documented Dark & OLED Theme tokens in Section 6 of `.agents/rules/design-rules.md`.
- **Verification:** All 12 unit tests passed. Committed and pushed to `main` (`ca6ad9e`).

---

### [2026-09-17] GitHub Pages Deployment Auto-Enablement Fix
- **Goal:** Fix `actions/configure-pages@v5` 404 error when Pages hasn't been enabled manually yet.
- **Key Changes:**
  - Added `with: enablement: true` to `.github/workflows/deploy.yml`.
  - Rebased with remote `data.json` commits and verified clean git fast-forward.

---

### [2026-09-17] Core PWA App Scaffolding & Study Engine
- **Goal:** Build the zero-server offline-first study PWA for Korean elementary math.
- **Key Changes:**
  - Initialized Vite + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`).
  - Integrated `katex` with `KaTeXView.tsx` component protecting against horizontal mobile overflow.
  - Built `src/services/srs.ts` implementing the SuperMemo SM-2 spaced repetition algorithm.
  - Built `src/services/github-sync.ts` with UTF-8 safe Base64 encoding for Korean Hangul and 409 conflict detection.
  - Built `src/services/storage.ts` using `idb-keyval` for IndexedDB persistence.
  - Seeded initial curriculum in `src/data/curriculum-seed.json` (Grades 1~6, 5 domains).
  - Created bilingual UI dictionaries in `src/i18n/ko.ts` (primary) and `src/i18n/en.ts`.
  - Implemented 3D flip study card with Korean IME `isComposing` event guards.
- **Verification:** Created 12 automated unit tests across `tests/sync.test.ts`, `tests/srs.test.ts`, and `tests/curriculum.test.ts` (100% pass rate).

---

### [2026-09-17] Project Constitution, Design Rules & 5-Skill Harness
- **Goal:** Establish permanent rules, guidelines, and harness skills for Antigravity pairing.
- **Key Changes:**
  - Created `AGENTS.md` specifying architecture, security, IME safety, and UTF-8 Base64 rules.
  - Created `.agents/rules/design-rules.md` detailing touch target sizes ($\ge 44\text{px}$), safe areas, and 5-domain color taxonomy.
  - Created 5 specialized skills in `.agents/skills/`:
    1. `1-curriculum-curator`
    2. `2-github-sync-harness`
    3. `3-pwa-mobile-audit`
    4. `4-srs-algorithm`
    5. `5-i18n-typography`
