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
  - [x] Automated GitHub Actions CI/CD to GitHub Pages (`.github/workflows/deploy.yml` with auto-enablement).
- [x] **Design & Branding**
  - [x] Deep OLED Black Dark Theme (`#020617` canvas, `#0f172a` cards, `#f8fafc` KaTeX contrast).
  - [x] Custom adaptive PWA app icons for Android (maskable & standard) and iOS touch icons.

---

## 📚 Phase 2: Curriculum & Content Depth (Next Up)
- [ ] **Full 68-Unit Elementary Expansion**
  - [ ] Expand starter decks into full 1~6th grade unit coverage (12 semesters, 68 units).
  - [ ] Grade 1~2: Number lines, basic addition/subtraction, time reading, multiplication table.
  - [ ] Grade 3~4: Fractions, angles, plane shapes, large numbers, multi-digit operations.
  - [ ] Grade 5~6: Divisors & multiples, fraction/decimal division, ratio & percentage, circle area, prism volume.
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
- [ ] **Advanced Cloud Sync**
  - [ ] Visual Conflict Resolver: When 409 conflict occurs, show side-by-side diff of local vs cloud data.
  - [ ] Offline Mutation Queue: Queue card reviews offline and auto-sync when network reconnects.
  - [ ] Auto-sync on app open and review session complete.
- [ ] **Backup & Data Portability**
  - [ ] One-click JSON backup export and import.
  - [ ] Anki export/import (`.tsv` or basic format compatibility).
  - [ ] Automatic timestamped revision snapshots before remote overwrites.

---

## 💡 Backlog & Future Exploration
- [ ] Audio pronunciation for Korean elementary math terms (Text-to-Speech).
- [ ] Middle school (중등 1~3학년) curriculum expansion pack.
- [ ] Handwriting / scratchpad canvas on iPad for scratch work before flipping the card.
