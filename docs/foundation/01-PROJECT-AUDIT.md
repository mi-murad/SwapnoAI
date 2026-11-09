# SWAPNO AI — PROJECT AUDIT
**Document ID:** `01-PROJECT-AUDIT`  
**Phase:** Foundation Sprint (Phases 1 & 2)  
**Date:** November 2026  
**Auditor:** Senior SaaS Architect & Technical Auditor  
**Status:** Complete & Verified Against Source Code  

> Historical audit snapshot. Later auth/workspace scaffolding and the Vercel frontend-only setup changed the implementation. For current verified findings, see [14-IMPLEMENTATION-AUDIT.md](./14-IMPLEMENTATION-AUDIT.md).

---

## 1. Executive Summary

A comprehensive source code and architectural audit of **SWAPNO AI — Your Marketing Adviser** was conducted on the existing prototype repository (`c:\Users\engrm\Downloads\Swapno AI\swapno_ai\swapno_ai`).

### Primary Finding
The current project is a **high-fidelity prototype and demo harness** originally scaffolded from a Google AI Studio / Cloud Run web applet template (`metadata.json`, `README.md`). It presents an impressive, styled user interface simulating an autonomous marketing operating system for Bangladeshi and SME businesses (specifically demonstrating profiles for **NiRBAAN Design Studio** and **Gourmet Hub**).

However, beneath the surface presentation:
1. **Zero Multi-Tenancy:** The application operates on a single flat file (`db.json`) on the server. There are no user accounts, no workspace IDs in the database, and no row-level or query-level tenant isolation.
2. **Simulated Authentication:** The login screen (`src/components/Login.tsx`) performs client-side state toggling via `setTimeout`. Any username/password combination bypasses authentication, and no session or JWT is issued.
3. **Simulated Integrations:** Meta (Facebook & Instagram) integration is entirely simulated via a client modal dialog (`setMetaConnected(true)`). There is no OAuth handshake, token exchange, webhook, or Graph API call.
4. **Simulated Publishing & Queue:** Clicking "Publish Now" or approving posts simply mutates a string attribute (`status: 'published'`) in local React state. There is no job queue, Redis, BullMQ, or worker process.
5. **Simulated Analytics & Export:** All analytics charts, metrics, and tables render hardcoded static numbers. PDF export and CMO Dossier compilation are mock timeouts triggering browser alerts.
6. **Fragile AI Integration with Silent Fallbacks:** The Express backend (`server.ts`) interfaces with `@google/genai` (SDK v2.11.0) targeting preview model names (`gemini-3.5-flash`, `gemini-3.1-flash-lite-image`). When the API key is missing, invalid, or rate-limited, the server catches errors and returns static pre-written copy without notifying the client that a fallback occurred.

---

## 2. Complete Feature Audit Table

The following audit evaluates every feature observed in the codebase against reality:

| Feature | Existing Implementation | Status | Problem / Vulnerability | Recommended Action |
|---|---|---|---|---|
| **User Registration** | `src/components/Login.tsx` (`handleSignupSubmit`) | **SIMULATED** | No backend endpoint. Form simply advances the local React state variable `screen` to `'onboarding'`. No data persisted. | Implement Supabase Auth / PostgreSQL `users` table with bcrypt password hashing or OAuth2. |
| **User Login** | `src/components/Login.tsx` (`handleLoginSubmit`), `src/App.tsx` | **SIMULATED** | Pre-fills mock email (`operator@nirbaan.design`); any click sets `isLoggedIn = true`. No password check, no token. | Implement JWT / session-based authentication with secure HTTP-only cookies. |
| **Workspace Management** | `src/App.tsx` (`currentWorkspace: 'A' \| 'B'`) | **SIMULATED** | Hardcoded toggle between Workspace A (NiRBAAN) and Workspace B (Gourmet Hub). State B is stored only in RAM. | Design relational `workspaces` and `workspace_members` tables. Enforce tenant isolation on all queries. |
| **Business Profile Coordinates** | `src/App.tsx` (Tab 7: `profile`), `server.ts` (`/api/state`) | **PARTIAL** | Profile inputs (name, industry, audience, description, tone) are saved to `db.json` for Workspace A only. Flat structure. | Migrate to normalized `brands` table with audit timestamps and multi-brand support per workspace. |
| **Business Brain (Elevator Pitch / Value Prop)** | `server.ts` (`/api/ai/brainstorm`), `src/App.tsx` | **PARTIAL** | Backend calls Gemini with prompt for pitch, value prop, competitors. Has local fallback. Missing structured ontological memory. | Build comprehensive Business Brain ontology (Identity, Visuals, Audience, Competitors, Objectives, Rules). |
| **Brand Asset Library** | `src/App.tsx` (`brandAssets` state) | **SIMULATED** | Stores image URLs in React state. Adding an asset pushes to local array; no file upload or storage bucket exists. | Integrate object storage (S3 / Cloudflare R2 / Supabase Storage) with asset metadata and tagging. |
| **Market Research Radar** | `src/components/MarketIntelligence.tsx`, `server.ts` (`/api/ai/research`) | **PARTIAL** | UI displays 4 hardcoded static question cards. Backend route generates JSON via Gemini, but UI doesn't bind backend research dynamically. | Re-architect Intelligence Hub to consume structured research from DB; incorporate live Google Search grounding. |
| **Marketing Strategy Generation** | `server.ts` (`/api/ai/strategy`), `src/types.ts` | **PARTIAL** | Generates 3 channels, 4 pillars, 2 themes. Works when Gemini API is active, but fallback hardcodes SaaS/agency responses. | Create Strategy Studio with editable pillars, campaign objectives, budget inputs, and revision history. |
| **Content Calendar Planning** | `server.ts` (`/api/ai/plan`), `src/components/ContentStudio.tsx` | **WORKING** (Prototype level) | Successfully generates 4 planned content items with dates, platforms, pillars, and image prompts. | Expand to 30-day monthly generation, multiple content types (Reels, Carousels, Stories), and drag-and-drop calendar. |
| **AI Copywriting Generation** | `server.ts` (`/api/ai/generate-content`), `src/components/ContentStudio.tsx` | **WORKING** (Prototype level) | Takes item title, platform, tone, and brand setup; prompts Gemini for platform-specific copy. Fallback activates on error. | Implement AI Router with prompt versioning, structured Zod validation, token tracking, and tone calibration. |
| **AI Image Generation** | `server.ts` (`/api/ai/generate-image`), `src/components/ContentStudio.tsx` | **SIMULATED / PARTIAL** | Attempts `gemini-3.1-flash-lite-image`. When unavailable, returns hardcoded Unsplash category photos based on keywords. | Integrate dedicated image API (Google Imagen 3, FLUX.1, or Recraft) with brand asset preservation rules. |
| **Content Editing Workspace** | `src/components/ContentStudio.tsx` (`openWorkspace` modal) | **WORKING** | Modal allows editing title, date, platform, pillar, caption, hashtags, notes, image prompt, and reference URLs. | Retain and refine this modal; persist updates directly to PostgreSQL `content_items` table. |
| **Content Approval Workflow** | `src/components/ContentStudio.tsx`, `src/App.tsx` (`handleToggleApprovePost`) | **PARTIAL** | Toggles post status between `'planned'` and `'approved'`. Bulk sign-off button exists. No role-based approval permissions. | Add user roles (`editor`, `approver`, `owner`) and recorded approval timestamps to ensure audit compliance. |
| **Post Scheduling** | `src/components/ContentStudio.tsx`, `src/App.tsx` (Tab 6: `automation`) | **SIMULATED** | Scheduled dates are stored as plain strings (`YYYY-MM-DD`). The "CRON QUEUE RUNNING" badge is a hardcoded animated SVG. | Build backend scheduler (Redis + BullMQ) with precision cron worker polling every 60 seconds. |
| **Live Social Publishing** | `src/App.tsx` (`handlePublishNow`), `src/components/CommandCenter.tsx` | **SIMULATED** | "Publish Now" updates item status to `'published'` in local state and logs a memory note. No HTTP request to Meta API. | Implement Meta Graph API adapter (Facebook Graph API & Instagram Content Publishing API) with status polling. |
| **Meta Platform Connection** | `src/App.tsx` (`authorizeMetaSuite`, `showMetaDialog`) | **SIMULATED** | Click displays modal with "Authorize Integration"; clicking button sets `metaConnected = true`. No OAuth, no app secrets. | Implement official Meta OAuth 2.0 flow, token exchange, encrypted database token storage, and token refresh cycle. |
| **Other Platforms (X, LinkedIn, TikTok, YouTube)** | Mentioned in docs, types, and settings UI | **MISSING** | No endpoints, adapters, or OAuth routes exist for any of these platforms. | Prioritize Facebook + Instagram for MVP (v1); architect pluggable platform adapters for Phase 10. |
| **Performance Analytics** | `src/App.tsx` (Tab 4: `analytics`), `server.ts` | **SIMULATED** | Renders static numbers (8,750 impressions, 1,215 clicks) and a static history table from `db.json`. No real metrics collector. | Build telemetry ingestion worker to fetch insights from Meta Graph API (`page_impressions`, `post_engagements`). |
| **Knowledge Vault / Brand Memory** | `src/App.tsx` (Tab 5: `knowledge`), `server.ts` | **PARTIAL** | Allows adding manual text notes to `memoryLogs` in `db.json`. Notes are not dynamically injected into LLM context prompts. | Store memory nodes in vector/relational DB; inject relevant memory nodes into system prompts during generation. |
| **Floating AI Copilot** | `src/components/FloatingAI.tsx`, `server.ts` (`/api/ai/chat`) | **WORKING** (Prototype level) | Sends message and state to `/api/ai/chat`. Returns structured reply, reasoning, confidence, and business impact. | Maintain this chat interface; connect it directly to the multi-agent AI Orchestrator and active workspace context. |
| **Executive Dossier / PDF Export** | `src/components/CommandCenter.tsx` (`triggerCmoReport`, `triggerPdfDownload`) | **SIMULATED** | `setTimeout` with `alert("Sustainable Growth Audit PDF compiled & exported successfully!")`. No PDF generation library. | Integrate `@react-pdf/renderer` or server-side Puppeteer to generate authentic, branded PDF executive summaries. |
| **Data Persistence** | `server.ts` (`readState`, `writeState`), `db.json` | **PARTIAL / DANGEROUS** | Single JSON file overwritten synchronously via `fs.writeFileSync`. Any user can wipe or overwrite the whole database. | Replace with PostgreSQL, migrations, connection pooling (Prisma / Drizzle / Kysely), and automated backups. |

---

## 3. Deep-Dive Codebase File Inventory

### 3.1 Backend Server (`server.ts`)
- **Framework:** Express 4.21.2 on Node.js, listening on port 5000 (`0.0.0.0:5000`).
- **Development Mounting:** Uses `createServer` from `vite` in middleware mode (`app.use(vite.middlewares)`), providing an all-in-one developer experience.
- **State Storage:** Reads from and writes to `path.join(process.cwd(), "db.json")`.
  - `readState()` uses `fs.readFileSync(DB_FILE, "utf-8")`.
  - `writeState()` uses `fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8")`.
  - **Risk:** Synchronous file I/O blocks the Node event loop under concurrent requests. No locking mechanism exists, guaranteeing data corruption or race condition overwrites under concurrent user traffic.
- **API Endpoints:**
  1. `GET /api/state` — Returns entire database state. No authentication.
  2. `POST /api/state` — Overwrites entire database state with `req.body`. No validation, no authentication.
  3. `POST /api/reset` — Overwrites database with `defaultState`.
  4. `POST /api/ai/chat` — Prompts Gemini for agent conversation.
  5. `POST /api/ai/brainstorm` — Prompts Gemini for elevator pitch and value proposition.
  6. `POST /api/ai/research` — Prompts Gemini for market overview, competitors, hashtags, personas.
  7. `POST /api/ai/strategy` — Prompts Gemini for marketing channels, pillars, themes.
  8. `POST /api/ai/plan` — Prompts Gemini for 4 content planner items.
  9. `POST /api/ai/generate-content` — Prompts Gemini for platform copy.
  10. `POST /api/ai/generate-image` — Attempts `gemini-3.1-flash-lite-image`, falls back to Unsplash photo links.
- **AI SDK Usage:**
  ```typescript
  import { GoogleGenAI, Type } from "@google/genai";
  // Initialized with GEMINI_API_KEY
  // Calls model: "gemini-3.5-flash"
  ```
  - **Critical Finding:** The SDK used is `@google/genai` (v2.11.0). The model name `"gemini-3.5-flash"` does not exist in standard public Gemini API releases (which offer `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash-exp`, or `gemini-2.0-flash`). In public environments without Google AI Studio internal routing, this API call fails immediately, triggering the silent fallback code.

### 3.2 Frontend Architecture (`src/App.tsx`)
- **State Architecture:** Monolithic React state initialized from `src/data/workspaceData.ts` and updated via `fetch('/api/state')`.
- **Workspace Switcher:**
  ```typescript
  const [currentWorkspace, setCurrentWorkspace] = useState<'A' | 'B'>('A');
  const [workspaceA, setWorkspaceA] = useState<SwapnoAppState>(workspaceAData);
  const [workspaceB, setWorkspaceB] = useState<SwapnoAppState>(workspaceBData);
  ```
  Switching to `'B'` switches the in-memory view to Gourmet Hub, but updates to `'B'` are never persisted to the server. Updates to `'A'` are sent via `POST /api/state`.
- **Navigation:** 8 tabs managed via local string state:
  - `dashboard` -> `<CommandCenter />`
  - `content` -> `<ContentStudio />`
  - `research` -> `<MarketIntelligence />`
  - `analytics` -> Inline Growth Analytics dashboard
  - `knowledge` -> Inline Knowledge Vault ledger
  - `automation` -> Inline Automation Hub & simulated Meta integration
  - `profile` -> Inline Brand Profile Coordinates editor
  - `settings` -> Inline AI Gateway config & factory reset
- **Simulated Triggers:**
  - `authorizeMetaSuite`: Opens modal dialog.
  - `confirmMetaSuite`: Sets `metaConnected = true`, adds a simulated memory log.
  - `triggerPdfExport`: Runs 2-second `setTimeout`, displays temporary success state.
  - `handlePublishNow`: Overwrites item status to `'published'`.

### 3.3 Components Analysis
- **`src/components/Login.tsx` (594 lines):**
  - Features Landing Screen, Signup Form, Onboarding Wizard, and Login Screen.
  - Contains rich marketing copy and bento-grid feature highlights.
  - The 4-step onboarding synchronization ("Initializing brand memory...", "Analyzing buyer demographics...", "Calibrating AI...") is driven by a chain of nested `setTimeout` calls (1000ms each) before invoking `onLogin('A', setup)`.
- **`src/components/CommandCenter.tsx` (911 lines):**
  - Renders dynamic Marketing Health Score formula based on field completeness.
  - Displays "27-Step Operating System Roadmap". Each step has a `done` boolean. Actions like "Compile Dossier" and "Export PDF" call `alert()`.
- **`src/components/ContentStudio.tsx` (1160 lines):**
  - The strongest component in the prototype. Contains full calendar view, status filters, card previews, post creation, post duplication, and full modal editing.
  - Social preview cards replicate LinkedIn, Instagram, Facebook, and Twitter styling.
- **`src/components/FloatingAI.tsx` (274 lines):**
  - Floating bottom-right chat widget with department detection based on `activeTab`.
  - Connects to `/api/ai/chat` and renders structured agent memos with reasoning and impact estimates.
- **`src/components/MarketIntelligence.tsx` (168 lines):**
  - Contains 4 static cards with high-quality business advice ("What Changed?", "Why It Matters?", "What Should I Do?"), but the data is hardcoded into the component rather than received from the backend research endpoint.

---

## 4. Technical Debt, Security, and Architectural Risks

### High Severity Risks
1. **Critical Multi-Tenancy Flaw:** Any client can read, overwrite, or delete all data for all users via unauthenticated HTTP requests (`GET/POST /api/state`, `POST /api/reset`). In a multi-user environment, User 2 would overwrite User 1's entire business state.
2. **Missing Backend Authentication:** There is zero server-side authentication. No passwords, tokens, API sessions, or cookies exist.
3. **Unvalidated Database Overwrites:** `POST /api/state` takes arbitrary untyped JSON and writes it to disk. Malicious or malformed payloads can crash the server on the next `JSON.parse`.
4. **Data Loss on Concurrent Access:** `fs.writeFileSync` on a single file without mutexes or atomic write patterns will corrupt `db.json` when two requests arrive simultaneously.

### Medium Severity Risks
5. **Silent AI Fallbacks:** When Gemini API fails or runs out of quota, the backend silently returns hardcoded mock text. The user has no indication that their AI output was fabricated rather than generated.
6. **Fake Publishing Assurance:** The UI marks posts as `published` and shows green badges without any actual connection to social APIs. If a user relies on this, their social accounts receive zero content.
7. **Model Name Incompatibility:** Public Gemini APIs reject `"gemini-3.5-flash"`. The production app requires standardized, GA model identifiers (`gemini-2.0-flash`, `gemini-1.5-pro`).
8. **Lack of File Storage:** Brand assets and images rely on external Unsplash URLs or base64 strings. There is no permanent S3/storage layer.

---

## 5. Audit Conclusion

The SWAPNO AI prototype provides an **excellent conceptual and visual foundation**. The domain model (`BusinessSetup`, `BusinessBrain`, `MarketResearch`, `Strategy`, `ContentItem`), the UI workflows in `ContentStudio.tsx`, and the UX philosophy ("One business, one memory, one connected workflow") are sound and mature.

However, **none of the backend infrastructure required for a multi-tenant commercial SaaS is currently functional**. The application must not be deployed to real users without implementing real authentication, a relational PostgreSQL database with Row-Level Security, an asynchronous job queue for publishing, real Meta OAuth/Graph API integrations, and a robust AI gateway with verifiable output validation.
