# Worldsmith

A browser-based 3D scene editor you can also talk to. Place and edit shapes manually, or type what you want — *"add a red sphere," "make it blue," "add a log cabin"* — and watch the AI build it.

**Live demo:** https://worldsmith-two.vercel.app

![Worldsmith demo](demo.gif)

## What it does

- Place, move, recolor, and delete 3D shapes by hand
- Control lighting mood (midday/sunset/night) and fog
- Save and load scenes as a file
- **Type natural language commands** and have them turn into real scene changes, via Google's Gemini AI
- **Conversation memory** — follow-up commands like "make it blue" correctly target whichever object you just mentioned, without repeating yourself
- Fully responsive — works on desktop and mobile

## How the AI integration actually works

Gemini never draws anything. It only ever returns a short list of structured **scene operations** as JSON — add this, recolor that, change the lighting — using Gemini's structured-output mode with a strict schema. The frontend is what turns those operations into real changes in the 3D scene, using the exact same functions triggered by the manual toolbar buttons. In other words: typing a sentence and clicking a button end up doing identical things under the hood.

you type a prompt
│
▼
/api/plan-scene ──► Gemini (structured JSON output only, never images/geometry)
│
▼
sceneStore.applyOps() ──► real state changes (add / recolor / move / lighting / fog)
│
▼
Three.js re-renders the scene



For real-world objects (a tree, a cabin) rather than plain shapes, the app shows a distinct stylized low-poly placeholder rather than a stuck loading spinner. The full pipeline for swapping this out with a real, uniquely-generated 3D model (via Tripo AI's text-to-3D API) is built and tested — the placeholder was kept as the final visual style as a deliberate cost decision, rather than paying per-generation for a portfolio demo.

## Tech stack

- **React + Vite** — app shell
- **React Three Fiber / Three.js** — 3D rendering, camera, lighting
- **Zustand** — shared scene state
- **Tailwind CSS** — styling
- **Gemini API** (via Vercel serverless functions) — natural language → structured scene operations
- **Tripo AI** — text-to-3D generation (integrated, not actively triggered)
- **Vercel** — hosting and serverless functions

## Running it locally

```bash
npm install
```

Create a `.env` file with:

GEMINI_API_KEY=your-key-here
TRIPO_API_KEY=your-key-here

Since AI features run through serverless functions, use the Vercel CLI rather than plain `npm run dev`:
```bash
npm install -g vercel
vercel dev
```

## What I'd build next

- Wire the Tripo generation pipeline back on with a usage cap, so real 3D models generate for a limited number of requests
- Undo/redo, using the same operations-based architecture that already powers the AI integration
- Multiplayer editing with a shared, synced scene