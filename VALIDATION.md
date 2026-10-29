# Validation and implementation notes

## Singapore Hokkien and family-memory update — 29 October 2026

- TypeScript check and production build: **PASS**.
- Vitest: **15 tests pass**. Covers existing progress/conversation behavior plus incremental and duplicate-safe XP, migration of old lump-sum balances, stable story-lesson IDs, keyword/fallback behavior, existing-word-only lesson selection, and draft bilingual replies.
- Playwright / Chromium: **15 tests pass** in the full final run. Covers the original journeys and photo/review/mobile checks, plus Home navigation with an in-app conversation notification, per-answer XP, distinct-reply rewards and exclusions, exactly three story content fields, lessons derived from saved memories, fallback topic navigation, legacy note retention and XP compatibility, and recording persistence/replay/editing.
- Original-audio replay was tested with a synthetic WAV uploaded with consent, saved to IndexedDB, reloaded, played, paused and rewound. Editing its story preserved the recording. No points were awarded for storing or replaying it.
- Device read-aloud start/stop controls were tested using a deterministic speech-service mock. Actual installed voices and speech-service behavior vary by laptop; this is not a claim of cross-device voice certification.
- Layout checks at **320px, 375px and 390px** pass. Browser-error checks in the learning and story-lesson journeys pass.
- The previous implicit description label included existing textarea text in label lookup. The editor now gives the field an explicit accessible label, verified in the recording-to-editor journey.
- App-managed story selection and practice remain local. Source links are references, not fetched translations. The optional device read-aloud feature clearly discloses that the browser/OS speech service may be online.

Current pronunciation scope: informal Singapore-friendly reading aids are now prominent and formal romanisation is available on demand. Referenced examples include “jiak” / “Jiak beh?” and “chu”. Other adapted phrases and bilingual bot replies remain draft, without validated pronunciation audio or a claim of proficient-speaker approval. See the README for sources and exact XP rules.

The service-worker cache version was updated for this release, with cleanup limited to older KITA caches. Original browser photographs, audio and stories retain the same IndexedDB schema. Older summaries/transcripts remain stored and readable under Earlier saved notes; the new form only asks for title, description and storyteller.

## Earlier baseline validation

Validated in the Codex cloud environment on 23 October 2026.

- TypeScript and Vite production build: **PASS**.
- Vitest: **6 tests pass**. Covers idempotent XP rewards, calendar streaks, context-sensitive simulation, clarification, review rules, contextual follow-ups and draft-content integrity.
- Playwright / system Chromium: **7 tests pass**. Covers the complete learn/practise/talk journey, photo-to-conversation-to-story journey, persistent story editing/deletion, photo upload/reload/edit/delete, synthetic review correction and audit persistence, and no document or app horizontal overflow at 320px, 375px and 390px across major routes.
- Major-screen capture: **11 screens**, no page errors reported. Home captures at the three specified widths are also included. Primary buttons, pale cards, fields and bottom navigation were visually inspected for contrast.
- Production PWA: service worker registered, a lesson route was visited, browser networking was disabled, and reloading that route succeeded with **no page errors**.
- Optional audio: Chromium synthetic microphone verified consent gating, record/stop, and nonempty audio Blob persistence after save and reload (**1,060 bytes in the test**). This verifies the browser path, not microphone compatibility on every real phone.
- `git diff --check`: no whitespace errors at validation time.

Issues found and fixed: a chat scroll effect accidentally returned a browser value as React cleanup; asynchronous save tests reloaded before navigation completed; direct editor routes needed an IndexedDB loading guard; per-request reviewer corrections needed isolated state. Recording stops when consent is withdrawn and active recording is cleaned up on route exit.

## Viewing

The production preview runs on **port 4173**, bound to `0.0.0.0`. Open that port through the Codex cloud environment preview. If it has stopped:

```sh
cd /workspace/kita-app
npm run build
npm run preview -- --port 4173
```

For development, run `npm run dev -- --port 5173` and preview port 5173. Vite may select the next port if a server is already running; use the port shown in its output.

## Known limits

All Hokkien content is unverified draft material, clearly marked in data and UI. There is no validated pronunciation audio. Teochew and Cantonese are future languages. AI and follow-up assistance are rules-based simulations. External review, model integration, user accounts, production reviewer authentication, cloud sync and backups are not implemented. The optional backend is a typed adapter and documented contract, not a running service. The internal review screen is an unlinked synthetic demonstration; real private conversations are never copied into that queue or uploaded. Family media remains in this browser and can be lost when site data is cleared. Service-worker offline support requires an initial successful visit; microphone and installation support varies by browser and requires HTTPS or localhost. Browser testing used Chromium; no claim is made about full Safari/Firefox, screen-reader, or real-device certification.
