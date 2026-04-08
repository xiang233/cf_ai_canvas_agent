# Canvas AI Agent — Cloudflare Edition

An AI-powered Canvas LMS assistant rebuilt on Cloudflare's platform.

**Stack:**
- 🤖 **LLM**: Llama 3.3 70B via Cloudflare Workers AI (no API key needed)
- ⚡ **Agent**: Cloudflare Agents SDK (`AIChatAgent` on Durable Objects)
- 💬 **Chat UI**: Vanilla JS frontend served via Cloudflare Assets
- 🗄️ **State/Memory**: Durable Object SQLite (persists across restarts & deploys)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Set your secrets

```bash
wrangler secret put CANVAS_URL
# enter: https://wustl.instructure.com

wrangler secret put CANVAS_TOKEN
# enter: your Canvas access token
```

### 3. Run locally

```bash
npm run dev
```

Open http://localhost:5173 (or whatever port Wrangler uses).

> Note: Workers AI bindings work locally with `wrangler dev` — no extra setup needed.

### 4. Deploy to Cloudflare

```bash
npm run deploy
```

Your agent will be live at `https://canvas-ai-agent.<your-subdomain>.workers.dev`

---

## How it maps to the assignment requirements

| Requirement | Implementation |
|---|---|
| **LLM** | Llama 3.3 70B FP8 via `@cloudflare/ai-sdk-provider` + Workers AI binding |
| **Workflow / coordination** | `AIChatAgent` on Durable Objects — each session is its own stateful instance |
| **User input (chat)** | WebSocket chat UI, session persisted via `localStorage` |
| **Memory / state** | Durable Object SQLite via `this.setState()` — survives restarts and deploys |

---

## Architecture

```
Browser (index.html)
    │  WebSocket  /agents/CanvasAgent/{sessionId}
    ▼
Cloudflare Worker (src/server.ts)
    │  routeAgentRequest()
    ▼
CanvasAgent Durable Object (one per session)
    ├── AIChatAgent (message history in SQLite)
    ├── streamText() → Llama 3.3 via Workers AI
    └── 21 Canvas tools → fetch() → wustl.instructure.com API
```

Each user gets their own Durable Object instance identified by `sessionId` (stored in `localStorage`).
The agent hibernates when idle (no cost) and wakes on the next message.

---

## Canvas Tools Included

| Category | Tools |
|---|---|
| Courses | `canvas_list_courses`, `canvas_get_modules`, `canvas_get_module_items` |
| Assignments | `canvas_get_assignments`, `canvas_submit_assignment` |
| Files | `canvas_get_files`, `canvas_get_file_info`, `canvas_get_folders`, `canvas_get_folder_files`, `canvas_search_files` |
| Discussions | `canvas_get_discussions`, `canvas_post_discussion`, `canvas_get_announcements` |
| Pages | `canvas_get_pages`, `canvas_get_page_content` |
| Grades & Calendar | `canvas_get_grades`, `canvas_get_calendar_events`, `canvas_get_todo_items`, `canvas_get_upcoming_events` |
| Quizzes & Groups | `canvas_get_quizzes`, `canvas_get_groups` |

---

## Project Structure

```
canvas-agent-cf/
├── src/
│   ├── server.ts          # CanvasAgent Durable Object + Worker entry point
│   └── canvas-tools.ts    # All Canvas API fetch() calls
├── public/
│   └── index.html         # Chat frontend (vanilla JS, no build step)
├── wrangler.jsonc          # Cloudflare config (Workers AI + Durable Objects)
├── package.json
└── tsconfig.json
```
