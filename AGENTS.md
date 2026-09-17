# AGENTS.md — Math For Dummy (초등 수학 학습 도구)

## 1. Project Overview & Identity
**Math For Dummy** is a lightweight, zero-server, offline-first Progressive Web App (PWA) designed for learning Korean elementary mathematics (2022 개정 초등 1학년~6학년 전 과정).

- **Primary Persona:** Personal study tool used across Desktop (Chrome/Edge), iPad (Safari touch), and Mobile (iOS/Android).
- **Core Architecture:** Client-side Single Page App (SPA) hosted on **GitHub Pages**, persisting data locally via **IndexedDB**, and syncing across devices using the **GitHub REST API** (`data.json` stored in a designated repository).
- **Language Default:** **Korean (한국어)** is the primary/default language, with an **English** toggle.

---

## 2. Technical Stack
- **Framework & Build:** Vite + TypeScript + React.
- **Styling:** **Tailwind CSS v4** (`@tailwindcss/vite`, CSS-first configuration via `@theme` in `src/index.css`).
- **PWA & Offline:** `vite-plugin-pwa` (Workbox Service Worker, Web App Manifest with `standalone` display).
- **Math Formula Rendering:** **KaTeX** (offline bundled fonts & formulas).
- **Client Storage:** `idb-keyval` (IndexedDB wrapper bypassing Safari's 5MB `localStorage` limit).
- **Icons:** `lucide-react`.
- **CI/CD:** GitHub Actions deploying static build (`dist/`) directly to GitHub Pages on push to `main`.

---

## 3. Strict Development & Behavioral Guidelines

### A. Korean IME (Input Method Editor) Safety
When listening for keyboard events (e.g., `Enter` to submit a card, `Space` to flip, `1-4` to rate):
```typescript
function handleKeyDown(e: KeyboardEvent) {
  // CRITICAL: Prevent premature triggers while Korean syllables are composing
  if (e.isComposing || e.keyCode === 229) return;
  // Handle keyboard shortcut...
}
```

### B. UTF-8 Safe GitHub API Payload Encoding
GitHub Contents API requires Base64. Standard JavaScript `btoa()` **crashes** on Korean Hangul characters. Always use the UTF-8 safe encoder:
```typescript
export const utf8ToBase64 = (str: string): string => {
  const bytes = new TextEncoder().encode(str);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binString);
};

export const base64ToUtf8 = (base64: string): string => {
  const binString = atob(base64);
  const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};
```

### C. GitHub REST API Concurrency (409 Conflict Prevention)
When syncing with GitHub:
1. `GET /repos/{owner}/{repo}/contents/{path}`: Retrieve both the content and the remote `sha`.
2. `PUT /repos/{owner}/{repo}/contents/{path}`: Always include the latest known `sha`.
3. If response status is `409 Conflict`, warn the user: "Remote data is newer. Please pull first or overwrite."

### D. Security & Secrets
- **NEVER** commit or hardcode GitHub Personal Access Tokens (PAT).
- PAT is supplied by the user inside the in-app Settings modal and stored solely in the client's local IndexedDB.

---

## 4. UI/UX & Design Directives (Summary)
Detailed design system rules are located in [`.agents/rules/design-rules.md`](./.agents/rules/design-rules.md).
- **Touch Targets:** Minimum $44 \times 44\text{px}$ for all buttons and interactive controls.
- **Safe Area Insets:** Use `env(safe-area-inset-*)` for iPhone notches and iPad home bars.
- **Word Wrapping:** Apply `word-break: keep-all;` to prevent breaking Korean syllables mid-word.
- **KaTeX Overflow:** Wrap all formula blocks in `overflow-x: auto;` to prevent breaking mobile card containers.
- **5-Domain Math Colors:**
  - 🔵 수와 연산 (Numbers & Operations): `#3B82F6`
  - 🟢 도형 (Geometry): `#10B981`
  - 🟡 측정 (Measurement): `#F59E0B`
  - 🟣 규칙성 (Patterns & Relationships): `#8B5CF6`
  - 🔴 자료와 가능성 (Data & Probability): `#F43F5E`

---

## 5. Agent Skills Harness Directory
Specialized skills are located in `.agents/skills/` and dynamically activated based on the task:

1. [`.agents/skills/1-curriculum-curator`](./.agents/skills/1-curriculum-curator/SKILL.md): Managing Korean elementary math decks (1~6학년, 5개 영역, KaTeX formula formatting).
2. [`.agents/skills/2-github-sync-harness`](./.agents/skills/2-github-sync-harness/SKILL.md): Testing serverless GitHub REST API sync, UTF-8 encoding, and SHA conflict handling.
3. [`.agents/skills/3-pwa-mobile-audit`](./.agents/skills/3-pwa-mobile-audit/SKILL.md): iPad/iPhone Safari standalone PWA validation, touch targets, and Service Worker caching.
4. [`.agents/skills/4-srs-algorithm`](./.agents/skills/4-srs-algorithm/SKILL.md): Spaced repetition scheduling (SM-2 interval and ease factor algorithms).
5. [`.agents/skills/5-i18n-typography`](./.agents/skills/5-i18n-typography/SKILL.md): Bilingual translations (`ko`/`en`), Hangul typography, and IME event handling.

---

## 6. Project Roadmap & History Tracking Protocol
The project maintains two tracking documents in the root directory that must be updated as work progresses:

1. **`PLAN.md` (Living Roadmap & Checklists):**
   - Contains phased milestones, tasks with checkboxes (`- [x]`, `- [ ]`), and backlog ideas.
   - The agent must consult `PLAN.md` to track progress and check off completed items.
   - Adjust and expand tasks flexibly as user requirements evolve.

2. **`HISTORY.md` (Rolling Work Log & Changelog):**
   - Records completed tasks in reverse-chronological order (newest first) with task goals, changes, and verification results.
   - **STRICT CONSTRAINT:** Keep `HISTORY.md` strictly under **300 lines**. When it exceeds 280 lines, prune the oldest entries at the bottom while keeping active milestone context.

