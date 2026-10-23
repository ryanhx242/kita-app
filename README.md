# KITA

A mobile-first, local-first Hokkien learning PWA for meaningful conversations with grandparents. Built with React, TypeScript, Vite, Tailwind CSS, Lucide, React Router and IndexedDB.

## Run in the Codex cloud environment

```sh
cd /workspace/kita-app
npm install
npm run dev -- --port 5173
```

Open the cloud environment's port preview for **5173**. Locally, visit http://localhost:5173. The app fills mobile screens and stays centred at 390px on desktop.

```sh
npm run build        # TypeScript check and production build
npm run preview -- --port 4173
npm test            # Vitest unit tests
npx playwright install chromium
npm run test:e2e    # browser journeys, persistence and mobile layouts
```

For production hosting, serve `dist/` over HTTPS and route unknown paths to `index.html`. The service worker activates only in production, caches visited assets and pages, and supports offline use after the first online visit. Microphone access and PWA installation require HTTPS or localhost. The SVG manifest icon works in supporting browsers; platform-specific install artwork would be needed for a full app-store release.

## Demonstration journeys

1. Home → Lessons → Music & songs → Learn vocabulary → finish the four questions → AI practice → Talk with an elder.
2. Family Album → Grandpa’s old radio → choose a question → Together time → Save a memory → save a text story, optionally record with consent → Story Library.

Every activity is independently accessible. XP is awarded once per activity, never for saving or recording private information. Calendar-day progress, favourites and dialect preferences use localStorage. Photos, stories and audio Blobs use IndexedDB. The six sample album items are original CSS/emoji illustrations, not real family photographs. Deleting a photo deletes linked stories; clearing site data permanently removes all local memories. No cloud sync or backup is provided.

## Honest prototype boundaries

- Hokkien is the only developed demonstration dialect; Teochew and Cantonese are labelled planned. All Hokkien expressions are explicitly marked **unverified draft** in structured data and UI. No proficient-speaker validation was supplied. There is no claimed validated audio, synthetic Hokkien pronunciation, live transcription or language-accuracy score.
- `SimulatedConversationService` is a context-aware scripted engine. Follow-ups are three rules-based English questions selected from the user's summary. Nothing is sent externally.
- `BackendConversationService` is an optional, unwired POST adapter to `/api/conversation`. No live backend is implemented. A real server must authenticate callers, protect keys, validate payloads, apply checks to generated outputs, obtain consent before transferring content, and enforce authorised reviewer access. Do not put secrets in Vite environment variables.
- `/internal/review` is a separate, unlinked development simulation with synthetic requests, withholding, approval/correction/replacement/rejection and timestamped decision history. It is deliberately not a production-authenticated review service. Normal chat uses a local review-rule fallback and does not copy private chat into the synthetic queue. Flagged generated output is not shown as approved.
- Recording is optional, requires explicit consent and browser microphone permission; permission denial leaves text storytelling available. Manually entered transcripts and summaries remain editable.
- The uploaded HTML prototype was used as a visual reference. Its emergency monitoring, emergency calling, safety tab, inaccurate prompt substitutions and localStorage image implementation were not carried forward.

## Architecture

`src/data.ts` holds structured dialect, topic, vocabulary, cue, photo and story models. `src/services/` separates progress, IndexedDB persistence, simulated/backend conversation adapters, review classification and follow-up assistance. `src/main.tsx` composes named reusable screens with route-based navigation. `src/style.css` provides the mobile design system alongside Tailwind's Vite integration. Privacy details and local deletion controls are in Settings. The prototype has no accounts, external reviewers, analytics, model training, or sharing service.

See `VALIDATION.md` for executed checks and limitations.
