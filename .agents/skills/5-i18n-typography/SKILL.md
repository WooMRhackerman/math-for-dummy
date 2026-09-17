---
name: i18n-typography
description: Management of Korean (Primary) and English UI localization, Pretendard font stack, Hangul IME event guards, and word-break rules.
---

# i18n & Typography Skill

This skill governs the bilingual localization engine and Korean typographic presentation standards.

## 1. i18n Architecture
- **Default Locale:** `'ko'` (Korean)
- **Secondary Locale:** `'en'` (English)
- Stored in local settings under `language`.

### Translation Dictionary Structure
All UI strings must be declared symmetrically in `src/i18n/ko.ts` and `src/i18n/en.ts`.
A simple `t(key)` helper provides typed lookups with fallback to Korean if an English string is missing.

## 2. Korean IME Composition Protection
When listening to keyboard events anywhere in the app (card reviews, search inputs, modal triggers), **always** protect against Hangul character composition:
```typescript
if (e.isComposing || e.keyCode === 229) {
  return;
}
```

## 3. Typographic Styling Directives
- **Font Stack:**
  `font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;`
- **Word Wrapping:**
  Always apply `break-keep` (`word-break: keep-all;`) to containers displaying Korean text so syllables are never orphaned across line breaks.
