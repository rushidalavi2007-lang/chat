# AETHER — Intelligent Personal AI Assistant
> *"Your Intelligence. Your Assistant."*

AETHER is a production-grade, full-stack personal AI assistant powered by Google Gemini models (`gemini-3.8-flash` and `gemini-3.1-flash-lite`). Engineered with a futuristic, tactile dark aesthetic—deep obsidian and charcoal surfaces, violet glow accents, and fine glassmorphic borders—AETHER delivers high-speed streaming intelligence, multimodal code and image audits, an interactive Artifact Workspace (Canvas), and a dedicated productivity workspace.

---

## 🌟 Advanced Professional Features

### 1. Dual-Engine Intelligence with High-Availability Failover
- **Flagship `gemini-3.8-flash`**: Advanced STEM reasoning, software architecture, algorithm proofs, and multi-turn context retention.
- **Ultra-Fast `gemini-3.1-flash-lite`**: Sub-second latency responses for quick lookups, brainstorming, and writing assistance.
- **Switchable in 1-Click**: Easily toggle engines right in the message composer.
- **High-Availability Failover**: Automatic seamless failover ensures continuous uptime even during upstream traffic spikes.

### 2. Interactive Artifact Workspace (Split-Screen Canvas)
- **Code & Web Artifacts**: Every code block or structured document includes an **"Open in Canvas"** button.
- **Live Sandboxed Preview**: Test rendered HTML/SVG web previews securely in an isolated iframe.
- **Direct File Downloads**: Save files with correct extensions (`.cpp`, `.py`, `.ts`, `.html`, `.sql`, `.md`, `.json`).
- **Send to Workspace Notes**: Archive any artifact directly into your Productivity Workspace with one click.

### 3. Multimodal Analysis & Drag-and-Drop
- **File Uploads**: Attach code files (`.cpp`, `.py`, `.ts`, `.sql`), documents (`.md`, `.txt`, `.csv`), or images (`.png`, `.jpg`, `.webp`).
- **Drag-and-Drop Overlay**: Drop files anywhere on the screen for instant multimodal inspection, debugging, and review.

### 4. Curated Prompt Library
- Production blueprints across 5 categories:
  - 🛠 **Software Engineering**: C++ Concurrency & Memory Audit, Clean Hexagonal Architecture, SQL Query Optimization.
  - 🏛 **System Design**: Distributed Rate Limiter, Microservice Event Streaming, Cache Invalidation.
  - 🔬 **STEM & Mathematics**: Bayes' Rule Derivation, Dijkstra Invariance & Big-O Proofs.
  - 📋 **Productivity & Execution**: 30-Day Engineering Sprint Breakdown, Sprint Milestone Gates.
  - ✍️ **Executive Strategy**: Amazon-style 6-Pager Decision Memos.

### 5. Extended Reasoning & Thinking Disclosure
- **Verifiable Thought Process**: Inspect step-by-step logic, query decomposition, context mapping, and syntax validation.
- **Configurable Thinking Level**: Tune reasoning depth to Low, Medium, or High in Settings.

### 6. Voice Dictation & Gemini TTS
- **Microphone Dictation**: Speak naturally with real-time browser speech recognition.
- **Gemini TTS (`gemini-3.8-flash-lite-tts`)**: High-fidelity spoken audio with 5 voice personas (Kore, Puck, Fenrir, Zephyr, Charon) and automatic Web Speech fallback.

### 7. Google Search Grounding
- Toggle live web search to ground answers with real-time sources, clickable reference links, and citations.

### 8. Real-Time Performance Metrics
- Live latency badge (e.g. `⚡ 1.03s`), active model identifier, character counts, and live token estimations.

---

## 🏗 Architecture & Security

```
┌────────────────────────────────────────────────────────┐
│            Browser Frontend (React 19 + TypeScript)    │
│  - Tailwind CSS + Lucide Icons                         │
│  - Artifact Workspace (Code + Sandboxed Live Preview)  │
│  - Curated Prompt Library Modal                        │
│  - Multimodal Drag-and-Drop File Uploader              │
│  - SSE Streaming Client & AbortController              │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP / SSE (/api/*)
┌───────────────────────────▼────────────────────────────┐
│               Full-Stack Node.js (Express)             │
│  - Health Check:      /api/health                      │
│  - SSE Chat Stream:   /api/chat/stream                 │
│  - Unary Chat:        /api/chat                        │
│  - Text-to-Speech:    /api/tts                         │
│  - High-Availability Auto-Failover Logic               │
└───────────────────────────┬────────────────────────────┘
                            │ Official @google/genai SDK (Server-Side Only)
┌───────────────────────────▼────────────────────────────┐
│                   Google Gemini API                    │
│  - Models: gemini-3.8-flash, gemini-3.1-flash-lite     │
│  - Model:  gemini-3.8-flash-lite-tts                   │
│  - Grounding: Google Search Tools                      │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Deploy to Render (recommended)

AETHER is a full-stack **Node.js Web Service**, not a static-only site. The Express server provides the AI API endpoints and serves the production React frontend.

1. Push the contents of this project folder to the root of a GitHub repository. If you keep the `aether-main` folder nested in the repository, set Render's **Root Directory** to `aether-main`.
2. In Render, create a **Web Service** from that repository (not a Static Site).
3. Use the following settings if Render does not automatically read the included `render.yaml`:
   - **Runtime:** Node
   - **Build command:** `npm install --include=dev && npm run build`
   - **Start command:** `npm run start`
   - **Health check path:** `/api/health`
   - **Node version:** `22.16.0`
4. In the Render service's **Environment** settings, add `GEMINI_API_KEY` with your real key from [Google AI Studio](https://aistudio.google.com/app/apikey). Do not put the key in frontend code or commit it to GitHub.
5. Save/redeploy. Test `https://YOUR-SERVICE.onrender.com/api/health`; it should report `"status":"healthy"` and `"aiConfigured":true`.

The project includes `render.yaml`, `.node-version`, and a complete walkthrough in `RENDER_DEPLOY.md`.

## Local development

```bash
npm install
cp .env.example .env
# Edit .env and replace the placeholder with your real GEMINI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production-like local test, run `npm run build` followed by `npm run start` with `NODE_ENV=production` and `GEMINI_API_KEY` set.

