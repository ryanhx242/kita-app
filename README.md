# KITA

A mobile-first, local-first Hokkien learning PWA for meaningful conversations with grandparents. Built with React, TypeScript, Vite, Tailwind CSS, Lucide, React Router and IndexedDB.

## Run on your laptop (Windows, macOS or Linux)

KITA runs in your normal web browser. You do not need Codex, a cloud preview, Docker, an API key, or a backend account.

### 1. Install Node.js

Install **Node.js 24 LTS** from https://nodejs.org/ using the installer for your laptop. npm is included. After installing, open a new terminal:

- **Windows:** open Command Prompt (search for `cmd` in the Start menu).
- **macOS:** open Terminal (Applications → Utilities → Terminal).
- **Linux:** open your terminal application.

Check the installation:

```sh
node --version
npm --version
```

### 2. Download KITA

**Without Git (easiest):** Open [the KITA application branch on GitHub](https://github.com/ryanhx242/kita-app/tree/feat/singapore-hokkien-story-learning), click the green **Code** button, then **Download ZIP**. Extract the ZIP first. Open a terminal in the extracted folder containing `package.json`. You can type `cd ` (with a trailing space), drag the extracted folder into the terminal to insert its path, and press Enter. On Windows, you can also open the extracted folder in File Explorer, type `cmd` in its address bar, and press Enter.

**With Git installed:** Open a terminal in the folder where you want to keep the project and run:

```sh
git clone --branch feat/singapore-hokkien-story-learning --single-branch https://github.com/ryanhx242/kita-app.git
cd kita-app
```

If GitHub asks you to sign in for a private repository, use the GitHub account that has access. The implementation is on `feat/singapore-hokkien-story-learning`; downloading the default branch may only give you the initial README.

### 3. Install and start

In the project folder, run these commands one at a time:

```sh
npm install
npm start
```

**Your browser should open KITA automatically at http://localhost:5173.** If it does not, paste that address into Chrome, Edge, Firefox or Safari yourself. Keep the terminal open while using the app. The narrow, centred mobile layout on a laptop is intentional.

Internet access is needed to download Node.js, the source and npm dependencies. Once installed, the demonstration needs no external AI service. The laptop server must keep running while you use it.

Press **Ctrl+C** in the terminal to stop the server. Next time, open a terminal in the same project folder and run only:

```sh
npm start
```

### Troubleshooting

- **`node` or `npm` is not recognised / command not found:** install Node.js, close the terminal, and open a new one.
- **`Could not read package.json` / `ENOENT`:** you are in the wrong folder. Open the extracted project folder containing `package.json` before running npm.
- **PowerShell says scripts are disabled:** use **Command Prompt**, or use `npm.cmd install` and `npm.cmd start` in PowerShell. No execution-policy change is needed.
- **Port 5173 is busy:** Vite prints the actual address, for example `http://localhost:5174`. Open that address, or run `npm start -- --port 5180`.
- **Browser says it cannot connect:** check that the terminal is still running and use the exact `Local` URL it prints. Do not double-click `index.html` or `dist/index.html`; the app needs its local server.
- **Microphone does not work:** allow microphone access when prompted. Recording is optional; all text and conversation features still work without it.
- **Photos or stories seem missing:** use the same browser and exact localhost address, including the port. Browser storage is separate for each address. Clearing browser data permanently removes these local memories.

## Build, offline demo and tests

To view a production build on your laptop:

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

Open http://localhost:4173. Visit the screens you want to demonstrate before going offline. The production service worker caches visited pages and assets; development mode does not register it. Localhost ports 4173 and 5173 have separate photo, story and progress storage. You must keep the preview server running to open uncached content.

Optional developer checks:

```sh
npm test
npx playwright install chromium
npm run test:e2e
```

The build runs TypeScript checks. Browser tests use installed system Chromium when available and Playwright Chromium otherwise. Linux may require browser system dependencies (`npx playwright install --with-deps chromium`).

For production hosting, serve `dist/` over HTTPS and route unknown paths to `index.html`. Microphone access and PWA installation require HTTPS or localhost. The SVG manifest icon works in supporting browsers; platform-specific install artwork would be needed for a full app-store release.

## Optional: Codex cloud environment

The laptop instructions above do not use `/workspace`. That path belongs only to the cloud environment. To run there instead:

```sh
cd /workspace/kita-app
npm install
npm run dev -- --port 5173
```

Use the cloud environment's port preview for the port printed by Vite. `npm run dev` binds to all interfaces for cloud access; `npm start` binds to the laptop's loopback address and opens the browser automatically.

## Demonstration journeys

1. Home → Lessons → Music & songs → Learn vocabulary → finish the four questions → AI practice → Talk with an elder.
2. Family Album → Grandpa’s old radio → choose a question → Together time → We had a conversation → Home with in-app confirmation. The notification offers an optional Save a memory link.
3. Family Album → Stories (or Save a story without a photo) → Save a story → enter **title, description and storyteller** → save → Replay this memory or Practise words from this story. Personal lessons also appear under Lessons → From your family stories.

Every activity is independently accessible. Vocabulary earns **5 XP per newly correct question**, immediately, rather than a lump sum at the end. AI practice earns **5 XP for each of the first three distinct conversation replies per lesson** (15 XP total); hints, duplicates and withheld messages do not earn XP. Replaying a rewarded question or practice milestone adds no extra XP. Each completed real-life conversation session earns **15 XP**, returns Home and displays a dismissible in-app notification. Learning completion markers are tracked separately from XP. Existing balances are migrated without adding past rewards again. Saving, attaching, recording or replaying memories earns no XP. Calendar-day progress, favourites and dialect preferences use localStorage. Photos, stories and audio Blobs use IndexedDB. The six sample album items are original CSS/emoji illustrations, not real family photographs. Deleting a photo deletes linked stories; clearing site data permanently removes all local memories. No cloud sync or backup is provided.

## Honest prototype boundaries

- Hokkien is the only developed demonstration dialect; Teochew and Cantonese are labelled planned. All Hokkien expressions are explicitly marked **unverified draft** in structured data and UI. No proficient-speaker validation was supplied. There is no claimed validated audio, synthetic Hokkien pronunciation, live transcription or language-accuracy score.
- `SimulatedConversationService` remains a context-aware scripted engine. Normal replies now include a short draft Hokkien response, Singapore reading aid and its English meaning, alongside English scenario context. The short Hokkien response is not presented as a translation of every English sentence. Sensitive/uncertain replies use a verification fallback. Follow-ups remain three rules-based English questions. The app does not send practice or stories to an AI provider.
- `BackendConversationService` is an optional, unwired POST adapter to `/api/conversation`. No live backend is implemented. A real server must authenticate callers, protect keys, validate payloads, apply checks to generated outputs, obtain consent before transferring content, and enforce authorised reviewer access. Do not put secrets in Vite environment variables.
- `/internal/review` is a separate, unlinked development simulation with synthetic requests, withholding, approval/correction/replacement/rejection and timestamped decision history. It is deliberately not a production-authenticated review service. Normal chat uses a local review-rule fallback and does not copy private chat into the synthetic queue. Flagged generated output is not shown as approved.
- The story form requires only title, description and storyteller. Optional recording controls are collapsed and require specific consent. You may record with the microphone or attach an existing audio file (up to 25 MB). Original recordings have play/pause/seek/replay controls and persist through reload. Optional **Read description aloud** uses a device English/Mandarin voice; it is labelled as device speech, never the elder’s voice or a Hokkien pronunciation guide. Depending on the browser and OS, device speech may use an online service and may be unavailable. Earlier saved summaries/transcripts are retained under Earlier saved notes when editing a story through the new three-field form.
- The uploaded HTML prototype was used as a visual reference. Its emergency monitoring, emergency calling, safety tab, inaccurate prompt substitutions and localStorage image implementation were not carried forward.

## Singapore Hokkien reading aids

Phrase cards, quizzes, word references and photo prompts now foreground informal Singapore-friendly readings such as **jiak**, **ho jiak** and **Jiak beh?**. Formal POJ romanisation is available in expandable references. These are learner reading aids, not a new phonetic standard or proof of accurate tone/pronunciation. `ⁿ` marks a nasal sound. Singapore households have different accents; the longer adapted sentences and chatbot phrases still require proficient-speaker review. No Mandarin TTS is substituted for Hokkien pronunciation.

Reference links are recorded with the relevant phrase data. We consulted [LearnDialect.sg’s Singapore-focused greeting guide](https://www.learndialect.sg/hokkien-how-do-you-say-have-you-eaten/) for **jiak** / **Jiak beh?**, its [understanding guide](https://www.learndialect.sg/hokkien-how-do-you-say-understand/) for local listening context, and the [Singapore Chinese Cultural Centre’s account of Singapore Hokkien](https://culturepaedia.singaporeccc.org.sg/language-education/the-hokkien-dialect-in-singapore/) for household/regional variation and **chu** (home). Those sources do not validate every adapted sentence in this prototype.

## Lessons from saved memories

Open a story and choose **Practise words from this story**. The local generator matches English and some Chinese keywords against the existing 12-word vocabulary bank, selects up to four relevant words, and fills the remaining places from the closest supported topic. For example, a memory about Grandpa listening to radio songs with friends can introduce song, listen, sing and friend. The matched terms are identified in the card context. Vocabulary quizzes, AI practice and conversation cues are available for the resulting lesson. Story-specific lesson IDs remain stable through navigation; changing the story content produces a new practice set. These are rules-based selections, not AI translations or arbitrary new Hokkien vocabulary. If no words match, the learner chooses a starting topic rather than being shown a fabricated match. Story content and original recordings stay in IndexedDB; no training or upload occurs. Audio-only stories are not transcribed: lesson matching uses the written title and description.

## Get this update with Git

If you already cloned KITA, stop the running server with Ctrl+C, then run in the project folder:

```sh
git fetch origin
git switch --track origin/feat/singapore-hokkien-story-learning
npm install
npm start
```

If the branch already exists locally, use `git switch feat/singapore-hokkien-story-learning` and `git pull --ff-only` instead of `git switch --track`. Keep any local changes before switching. Continue using the same browser and localhost port to retain that browser’s existing memories and progress. Git operations do not transfer browser storage to another laptop.

## Architecture

`src/data.ts` holds structured dialect, topic, vocabulary, cue, photo and story models. `src/services/` separates progress, IndexedDB persistence, simulated/backend conversation adapters, review classification, follow-up assistance and deterministic story-vocabulary selection. `src/components/StoryReplay.tsx` handles original recording playback and optional device read-aloud. `src/main.tsx` composes named reusable screens with route-based navigation. `src/style.css` provides the mobile design system alongside Tailwind's Vite integration. Privacy details and local deletion controls are in Settings. The prototype has no accounts, external reviewers, analytics, model training, or sharing service.

See `VALIDATION.md` for executed checks and limitations.
