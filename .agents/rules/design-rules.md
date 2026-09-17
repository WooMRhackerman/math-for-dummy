---
trigger: model_decision
description: UI/UX Design System, mobile/iPad touch guidelines, math typography, and color taxonomy for Math For Dummy.
---

# Design Rules & UI/UX Guidelines — Math For Dummy

## 1. Ergonomics & Touch Guidelines (iPad & Mobile First)

- **Touch Targets:**
  - Every button, card, input, and interactive badge MUST have a clickable area of at least **$44 \times 44\text{px}$** (Tailwind: `min-h-11 min-w-11` or adequate padding).
  - Ensure generous padding between adjacent buttons to prevent mis-taps on small touchscreens.
- **Safe Area Insets:**
  - Main containers and bottom floating action bars must account for mobile gestures and notches:
    ```css
    padding-top: max(1rem, env(safe-area-inset-top));
    padding-bottom: max(1rem, env(safe-area-inset-bottom));
    padding-left: max(1rem, env(safe-area-inset-left));
    padding-right: max(1rem, env(safe-area-inset-right));
    ```
- **Tap Delay Prevention:**
  - Add `touch-action: manipulation;` to all clickable elements to disable double-tap-to-zoom delays on iOS Safari.
- **Thumb Zone Design:**
  - During flashcard review sessions, the primary action buttons (Flip, Again, Hard, Good, Easy) must be located in the bottom half / bottom bar of the viewport within easy thumb reach.

---

## 2. Typography & Math Rendering (KaTeX)

- **Font Family:**
  ```css
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  ```
- **Word Wrapping for Korean:**
  - Every body paragraph, question, and answer block MUST include `word-break: keep-all;` (Tailwind: `break-keep`). This prevents Korean text from awkwardly splitting single words across lines.
- **KaTeX Equation Protection:**
  - Any element containing a rendered LaTeX/KaTeX formula must have:
    ```css
    overflow-x: auto;
    max-width: 100%;
    -webkit-overflow-scrolling: touch;
    ```
  - Formulas must match the base font color and scale naturally with text size (`text-lg`, `text-xl`).

---

## 3. Color Taxonomy (5 Math Domains)

Each of the 5 Korean elementary math domains has a designated visual identity used for badges, card borders, and progress indicators:

| Domain (한국어) | English | Tailwind Variable | Hex Code | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **수와 연산** | Numbers & Operations | `--color-domain-numbers` | `#3B82F6` (Blue) | Natural numbers, fractions, decimals, arithmetic |
| **도형** | Geometry | `--color-domain-geometry` | `#10B981` (Emerald) | Plane shapes, solid figures, circles, angles |
| **측정** | Measurement | `--color-domain-measurement` | `#F59E0B` (Amber) | Length, time, weight, area, volume |
| **규칙성** | Patterns & Relationships | `--color-domain-patterns` | `#8B5CF6` (Violet) | Number patterns, tables, proportions, ratios |
| **자료와 가능성** | Data & Probability | `--color-domain-data` | `#F43F5E` (Rose) | Graphs, averages, statistics, probability |

---

## 4. Spaced Repetition (SRS) Rating Colors

The 4 review rating buttons provide clear, tactile chromatic feedback:

| Rating | Label (KO) | Label (EN) | Color Token | Hex | Shortcut |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **다시** | Again | `--color-srs-again` | `#EF4444` (Red) | `1` |
| 2 | **어려움** | Hard | `--color-srs-hard` | `#F97316` (Orange) | `2` |
| 3 | **적당함** | Good | `--color-srs-good` | `#3B82F6` (Blue) | `3` |
| 4 | **쉬움** | Easy | `--color-srs-easy` | `#10B981` (Green) | `4` |

---

## 5. Tactile Card Flip & Layout Shift (CLS = 0)

- **3D Card Flip Animation:**
  - The card flip must use CSS 3D transforms (`perspective: 1000px`, `transform-style: preserve-3d`, `transition: transform 0.4s ease-out`).
  - Card front and back must use `backface-visibility: hidden;`.
- **Zero Layout Shifts:**
  - The study card container must have a defined minimum height (e.g. `min-h-[320px]` on mobile, `min-h-[400px]` on tablet/desktop) so that flipping the card or rendering KaTeX equations does not cause sudden jumping or layout jitter.

---

## 6. Dark & OLED Black Theme Guidelines

- **Canvas & Card Contrast:**
  - **Background Canvas:** `bg-slate-950` (`#020617`) for battery efficiency on OLED/iPad and zero glare.
  - **Card Surfaces:** `bg-slate-900` (`#0f172a`) with subtle `border-slate-800` borders.
  - **Card Back (Flipped):** Pure dark `bg-black` (`#000000`) with emerald answer badge.
- **KaTeX Equations in Dark Mode:**
  - KaTeX math formulas, fractions, and radicals MUST render in `#f8fafc` with high contrast against dark backgrounds.
- **Domain Badges (Dark Mode):**
  - Use high-contrast deep pastel badges (`dark:bg-*-950/80 dark:text-*-300 dark:border-*-800`).
- **SRS Buttons (Dark Mode):**
  - Tinted glow buttons (`dark:bg-*-950/40 dark:border-*-900/60 dark:text-*-400`) to preserve color meaning without blinding nighttime users.
