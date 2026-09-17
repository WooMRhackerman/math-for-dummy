---
name: github-sync-harness
description: Runbook and test protocols for serverless GitHub REST API cross-device data sync, UTF-8 Base64 encoding for Korean Hangul, and SHA 409 conflict handling.
---

# GitHub Sync Harness Skill

This skill governs testing, debugging, and maintaining the cross-device serverless database sync engine backed by the GitHub REST API.

## 1. REST API Protocol Reference
The app persists study data to a target repository as a single `data.json` file via GitHub Contents API:

- **Endpoint:** `https://api.github.com/repos/{owner}/{repo}/contents/{path}`
- **Headers:**
  - `Accept: application/vnd.github.v3+json`
  - `Authorization: Bearer <PAT>`
  - `X-GitHub-Api-Version: 2022-11-28`

### A. Pull (Fetch Data)
1. Send `GET` to endpoint.
2. If `404 Not Found`: File doesn't exist yet; prompt user to push local data or seed initial curriculum.
3. If `200 OK`: Extract `content` (base64 string) and `sha`.
4. Decode `content` using `base64ToUtf8()` (never use raw `atob()`!).
5. Store remote data and update local `lastKnownSha`.

### B. Push (Save Data)
1. Encode current JSON data to base64 using `utf8ToBase64()`.
2. Prepare PUT payload:
   ```json
   {
     "message": "sync: update study data [skip ci]",
     "content": "<base64_string>",
     "sha": "<lastKnownSha>"
   }
   ```
3. Send `PUT` to endpoint.
4. If `200` or `201`: Save new `sha` returned by GitHub.
5. If `409 Conflict`: SHA mismatch (remote was modified by another device). Warn user and require manual merge/pull.

## 2. UTF-8 Base64 Roundtrip Verification
Always run test cases verifying Korean syllables (Hangul), symbols, and LaTeX math strings survive encoding and decoding without byte loss.
