# Work History & Changelog — Math For Dummy

> **Agent Maintenance Rule:**
> - Record all completed tasks and modifications in reverse-chronological order (newest first).
> - Keep this file concise and strictly **under 300 lines**.
> - When the file exceeds 280 lines, prune the oldest entries at the bottom while preserving active milestone summaries.

---

### [2026-09-18] Supabase Real-Time Web Cloud Sync Migration
- **Goal:** Completely bypass Google Cloud domain verification and OAuth approval roadblocks by migrating cross-device synchronization to Supabase PostgreSQL & Auth with instant 1-second sign-in and real-time auto-saving.
- **Key Changes:**
  - Installed `@supabase/supabase-js` and configured live user project (`https://ighvfbwdyrtgkkyhmgzi.supabase.co`).
  - Built `src/services/supabase-sync.ts` implementing `signUpWithEmail`, `signInWithEmail`, `signOutSupabase`, `getSupabaseUser`, `pullFromSupabase`, and `pushToSupabase`.
  - Configured `supabase` as the default sync provider across `SyncManager`, `storage.ts`, and `App.tsx`.
  - Redesigned `src/components/SettingsModal.tsx` with a prominent Supabase Hero Card featuring email/password sign-in, 1-second registration, active user badge, and manual Push/Pull actions.
  - Implemented background real-time auto-saving to Supabase on every flashcard rating (`handleRateCard`) and automatic cloud pull on app launch.
  - Relocated Google Drive OAuth and Windows Explorer local folder sync to collapsible Advanced Settings.
  - Published static `public/privacy.html` and `public/terms.html` and updated privacy policy covering Supabase and RLS.
  - Updated `tests/sync-manager.test.ts` to assert Supabase default provider behavior and connection state.
- **Verification:** All 24 automated unit tests passed (`npm test`). `npm run typecheck`, `npm run verify:curriculum`, and `npm run build` completed with 0 errors.

---

### [2026-09-18] Google Drive Web Interface & Auto-Authentication (Real Web Client ID)
- **Goal:** Replace OS Windows Explorer file picker with pure web-based Google Identity Services (GIS) auto-authentication using registered Google Cloud Web Client ID (`712761103246-...apps.googleusercontent.com`).
- **Key Changes:**
  - Integrated the verified Google OAuth 2.0 Web Client ID into `src/services/google-drive-sync.ts`.
  - Re-established `google-drive` as the primary default sync provider in `SyncManager` and `App.tsx`.
  - Redesigned `src/components/SettingsModal.tsx` placing the Google Web Sign-In card in the primary hero spot with 1-click Google web login popup, user profile card, push/pull actions, and auto-sync notice.
  - Relocated the local Windows Explorer file system access tool to the collapsible Advanced Settings section.
  - Added real-time auto-saving to Google Drive in `handleRateCard` in `src/App.tsx`.
  - Updated `tests/sync-manager.test.ts` to assert `google-drive` default provider and multi-provider transitions.
- **Verification:** All 24 unit tests passed (`npm test`). `npm run typecheck` and `npm run verify:curriculum` passed with 0 errors. Production bundle and PWA service worker generated successfully (`npm run build`).

---

### [2026-09-18] Direct Google Drive & OneDrive Native File Sync (Zero OAuth / Zero Token)
- **Goal:** Completely eliminate the developer Google Cloud Console registration and OAuth 401 error barrier by enabling direct, real-time file synchronization directly inside the user's local Google Drive (G: drive) or OneDrive sync folder.
- **Key Changes:**
  - Built `src/services/cloud-drive-file.ts` leveraging the standard File System Access API (`showOpenFilePicker` and `showSaveFilePicker`).
  - Added real-time auto-saving directly in `handleRateCard` in `src/App.tsx` streaming changes instantly to the connected cloud drive file upon every card rating.
  - Implemented persistent handle storage via `idb-keyval` to keep file connections active across page reloads.
  - Updated `src/services/sync-manager.ts` and `src/types/sync.ts` with `'cloud-file'` as primary sync provider.
  - Revamped `src/components/SettingsModal.tsx` highlighting the Google Drive / OneDrive direct connection with live status indicator, file creation, reconnect, reload, and non-Chromium fallback notices.
  - Installed `@types/wicg-file-system-access` for strict type safety.
  - Updated `tests/sync-manager.test.ts` to assert `'cloud-file'` lifecycle and multi-provider transitions.
- **Verification:** All 24 unit tests passed (`npm test`). `npm run typecheck` and `npm run verify:curriculum` passed with 0 errors. Production build (`npm run build`) succeeded with PWA service worker generation.

---

### [2026-09-18] Google Cloud (Google Drive AppData API) Sync Transition
- **Goal:** Migrate progress data management from cumbersome GitHub PAT tokens to frictionless 1-click Google Drive synchronization with modular provider support.
- **Key Changes:**
  - Built `src/services/google-drive-sync.ts` integrating Google Identity Services (GIS) OAuth 2.0 token client and Google Drive v3 REST API targeting the hidden, isolated `appDataFolder`.
  - Built `src/services/sync-manager.ts` creating a pluggable provider pattern (`google-drive` primary, `github` secondary, and `local`).
  - Added IndexedDB storage methods in `src/services/storage.ts` for Google OAuth sessions and active sync provider persistence.
  - Redesigned `src/components/SettingsModal.tsx` to feature a 1-click "Google 계정으로 동기화" button, connected profile card (avatar, name, email, disconnect), and expandable accordion for advanced GitHub & local JSON backup.
  - Added JSON backup export and import/restore handlers.
  - Updated bilingual dictionaries (`src/i18n/ko.ts`, `src/i18n/en.ts`) with Google Cloud sync strings.
  - Added `tests/google-drive-sync.test.ts` (7 tests) and `tests/sync-manager.test.ts` (3 tests).
- **Verification:** All 24 unit tests passed (`vitest run`). `npm run typecheck`, `npm run verify:curriculum`, and `npm run build` succeeded without errors.

---

### [2026-09-17] Complete CI/CD Pipeline Automation & Repository Badges
- **Goal:** Establish a complete two-tier CI/CD architecture with pull request automated quality gates, curriculum verification audits, enhanced GitHub Pages deployment, and root repository documentation.
- **Key Changes:**
  - Added `tsx` to `devDependencies` and npm scripts (`typecheck`: `tsc --noEmit`, `verify:curriculum`: `tsx verify-curriculum.ts`).
  - Created `.github/workflows/ci.yml` running on pull requests and feature branches with 4 strict gates: typecheck, unit tests, curriculum audit, and production build.
  - Enhanced `.github/workflows/deploy.yml` with pre-deployment quality gates (typecheck and curriculum verification before pages artifact upload).
  - Created root `README.md` featuring CI & CD live status badges, 2022 curriculum summary, SM-2 SRS details, tech stack table, and local setup guide.
- **Verification:** Ran `npm run typecheck`, `npm run verify:curriculum`, `npm test` (14 tests passed), and `npm run build` locally. Committed, pushed to `origin main`, and verified live deployment.

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
