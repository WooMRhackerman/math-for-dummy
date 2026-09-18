# Project Roadmap & Implementation Plan — Math For Dummy

> **Agent Maintenance Protocol:**
> - Keep this document updated after each milestone or major task.
> - Mark completed tasks with `[x]` and add new tasks under appropriate phases or the Backlog.
> - Tasks and phases are living documents designed to adapt flexibly as requirements evolve.

---

## 🚀 Phase 1: Core Foundation & Infrastructure (Completed)
- [x] **Project Architecture & Rules**
  - [x] Define `AGENTS.md` constitution (zero-server, GitHub REST DB, Korean IME guards, UTF-8 Base64).
  - [x] Establish UI/UX design rules (`.agents/rules/design-rules.md`) with 5-domain color taxonomy and touch ergonomics.
  - [x] Create 5-part skills harness (`.agents/skills/`) for curriculum, sync, PWA, SRS, and i18n.
- [x] **Tech Stack Setup**
  - [x] Vite + React + TypeScript scaffolding.
  - [x] Tailwind CSS v4 styling (`@tailwindcss/vite`, `@theme` tokens, `@custom-variant dark`).
  - [x] KaTeX offline bundled formula rendering engine with responsive horizontal scroll guards.
  - [x] Client storage persistence via `idb-keyval` (IndexedDB bypassing Safari 5MB limit).
- [x] **Study Engine & UI**
  - [x] 3D tactile flashcard flip interface with zero cumulative layout shifts.
  - [x] SuperMemo SM-2 spaced repetition algorithm (Ratings: Again, Hard, Good, Easy).
  - [x] Grade 1~6 filters and 5-domain category filters (수와 연산, 도형, 측정, 규칙성, 자료와 가능성).
  - [x] Bilingual localization engine (`ko` primary, `en` toggle).
- [x] **Cloud Sync & CI/CD**
  - [x] Serverless GitHub REST API sync engine (`data.json`) with fine-grained PAT support.
  - [x] Dedicated CI workflow (`.github/workflows/ci.yml`) for pull requests (typecheck, tests, curriculum audit, build).
  - [x] Automated CD pipeline (`.github/workflows/deploy.yml`) to GitHub Pages with auto-enablement and pre-deploy gates.
  - [x] Root `README.md` with live CI/CD status badges and comprehensive architecture overview.
- [x] **Design & Branding**
  - [x] Deep OLED Black Dark Theme (`#020617` canvas, `#0f172a` cards, `#f8fafc` KaTeX contrast).
  - [x] Custom adaptive PWA app icons for Android (maskable & standard) and iOS touch icons.

---

## 📚 Phase 2: Curriculum & Content Depth
- [x] **Full 70-Unit Elementary Expansion (12 Semesters, Grades 1~6)**
  - [x] Expand starter decks into full 1~6th grade unit coverage (12 semester decks, 70 units).
  - [x] Grade 1~2: Numbers to 100, addition/subtraction, shapes, time reading, multiplication tables (22 units).
  - [x] Grade 3~4: Fractions & decimals, angles, plane shapes, multi-digit operations, bar & line graphs (24 units).
  - [x] Grade 5~6: Divisors & multiples, fraction/decimal operations, ratio & percentage, circle area, prism volume (24 units).
  - [x] Deck list badge updated to display `{deck.grade}학년 {deck.semester}학기`.
  - [x] Verified 100% 5-domain coverage with KaTeX rendering integrity.
- [ ] **Interactive Visual Diagrams**
  - [ ] SVG/Canvas dynamic geometric shapes for Geometry units (angle arcs, parallel lines, 3D nets).
  - [ ] Visual fraction bars and number lines for Numbers & Operations.
- [ ] **Deck Customization & Card Creator**
  - [ ] In-app Card Creator modal to add custom personal study cards.
  - [ ] Edit and delete existing cards directly from the study view.
  - [ ] Tagging and difficulty badges per card.

---

## 🧠 Phase 3: Study Experience & SRS Analytics
- [ ] **Study Session Enhancements**
  - [ ] Study queue customizer: "Quick 10-card review", "Only Due Cards", or "Cram Whole Unit".
  - [ ] Front/Back reverse study mode (Guess concept from formula/definition).
  - [ ] Keyboard shortcuts modal overlay (trigger with `?` key).
- [ ] **Analytics & Motivation**
  - [ ] Daily study streak tracker (saved in IndexedDB and cloud `data.json`).
  - [ ] Heatmap calendar view showing daily review volume.
  - [ ] Mastery progress bar per grade and per domain.
  - [ ] Optional audio / haptic feedback on card flip and review submission.

---

## 🔄 Phase 4: Sync & Multi-Device Reliability
- [x] **Supabase Real-Time Web Cloud Sync (Zero-Friction Authentication)**
  - [x] Integrated `@supabase/supabase-js` with live user project credentials.
  - [x] Implemented `src/services/supabase-sync.ts` (Email/Password Auth, user session persistence, `user_progress` upsert/pull).
  - [x] Made `supabase` the primary default sync provider across `SyncManager`, `storage.ts`, and `App.tsx`.
  - [x] Created hero card in `src/components/SettingsModal.tsx` with email/password login, 1-second sign-up, user profile badge, and manual Push/Pull.
  - [x] Implemented background real-time auto-saving to Supabase on every flashcard review rating (`handleRateCard`).
  - [x] Auto-pull of latest study progress upon app launch when user is authenticated.
  - [x] Relocated Google Drive OAuth and local file explorer sync to collapsible Advanced Settings.
- [x] **Google Drive Web Interface & Auto-Authentication (1-Click GIS Web Popup)**
  - [x] Configured official Google Cloud OAuth 2.0 Web Client ID (`712761103246-...apps.googleusercontent.com`) directly in `src/services/google-drive-sync.ts`.
  - [x] Enabled pure web-based Google Identity Services login popup (`accounts.google.com`) with zero Windows Explorer.
  - [x] Real-time auto-saving directly to Google Drive AppData (`math_for_dummy_data.json`) on card reviews.
  - [x] User profile presentation (avatar, name, email) with 1-click Push/Pull and disconnect.
- [x] **Direct Google Drive / OneDrive Native File Sync (Zero-Token Option 2)**
  - [x] Implemented `src/services/cloud-drive-file.ts` with File System Access API (`pickCloudDriveFile`, `createCloudDriveFile`, `readDataFromFileHandle`, `writeDataToFileHandle`).
  - [x] Allows users to select or create a file directly in their local Google Drive (G: drive) or OneDrive sync folder.
  - [x] Real-time background auto-saving on every flashcard review rating (`handleRateCard`).
  - [x] Persistent `FileSystemFileHandle` storage in IndexedDB so cloud connection survives browser reloads.
  - [x] Graceful detection and fallback guidance for non-Chromium browsers (Safari, Firefox).
- [ ] **Advanced Cloud Sync**
  - [ ] Visual Conflict Resolver: When conflict occurs, show side-by-side diff of local vs cloud data.
  - [ ] Offline Mutation Queue: Queue card reviews offline and auto-sync when network reconnects.
  - [ ] Auto-sync on app open and review session complete.
- [ ] **Backup & Data Portability**
  - [ ] Anki export/import (`.tsv` or basic format compatibility).
  - [ ] Automatic timestamped revision snapshots before remote overwrites.

---

## 💡 Backlog & Future Exploration
- [ ] Audio pronunciation for Korean elementary math terms (Text-to-Speech).
- [ ] Middle school (중등 1~3학년) curriculum expansion pack.
- [ ] Handwriting / scratchpad canvas on iPad for scratch work before flipping the card.
