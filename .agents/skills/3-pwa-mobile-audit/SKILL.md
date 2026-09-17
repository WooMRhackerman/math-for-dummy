---
name: pwa-mobile-audit
description: Procedures for auditing PWA installation, Service Worker offline caching, iOS/iPad Safari standalone display, and mobile viewport ergonomics.
---

# PWA & Mobile Audit Skill

This skill provides step-by-step verification rules for ensuring the study tool installs cleanly as a native-feeling PWA and functions completely offline on mobile and iPad.

## 1. Web App Manifest Standards (`manifest.json`)
The manifest must contain:
- `name`: "수학 학습 도구 (Math For Dummy)"
- `short_name`: "수학공부"
- `start_url`: "./"
- `display`: "standalone"
- `background_color`: "#F8FAFC"
- `theme_color`: "#3B82F6"
- `icons`: At least 192x192 and 512x512 PNG icons with `"purpose": "any maskable"`.

## 2. iOS Safari Standalone Requirements
Safari on iOS/iPad requires explicit `<meta>` and `<link>` tags in `index.html`:
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="수학공부" />
<link rel="apple-touch-icon" href="/icon-192.png" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

## 3. Service Worker Cache Strategy (Workbox)
- **App Shell & Assets (`index.html`, CSS, JS):** Stale-While-Revalidate or Cache-First with automated hash revisioning via Vite.
- **KaTeX Fonts (`.woff2`):** Cache-First with long expiration (1 year).
- **GitHub API requests:** Network-Only (never cache authenticated API requests in the Service Worker).
