# Counsilio

Jurisdiction-aware legal drafting assistant as a **local macOS desktop app**. Choose a workspace folder on your Mac, load matching official law sources, and draft papers with citations grounded in your files — no uploads.

## Run (everyday development)

```bash
cd /Users/baqir/Projects/counsilio
npm install
npm run dev
```

This starts Next.js for the UI **and** opens the **Electron** window pointed at it. Edit files under `src/` and they hot-reload. You do **not** need to package an `.app` to try features.

- Electron main-process code lives in `electron/`. Saving those files restarts Electron via `electronmon`.
- UI-only: `npm run dev:ui` (browser at http://localhost:3000 — no local folder access).

## Package the Mac app

```bash
npm run dist
```

Creates `release/Counsilio.app` and a `.dmg`. Use this when you want to install Counsilio in Applications or share a build — not for each feature tweak.

## What’s included

- Desktop shell (Electron) with full local disk access
- Onboarding: **workspace folder** → country → language → profile → disclaimer
- Azure-style assistant: ~1/5 folder explorer | ~4/5 chat workspace
- Drag-and-drop / click / `@` attach from the workspace (paths stay local)
- Offline BM25 search over indexed PDF, Word, Markdown, and text files
- Documents studio and Settings (including re-index / change folder)
- Profile + workspace path stored in Electron `userData` (`settings.json`)
- Per-workspace index in `.counsilio/index.json` inside your chosen folder

## Note

Counsilio is drafting and research assistance only — not a law firm and not legal advice.
