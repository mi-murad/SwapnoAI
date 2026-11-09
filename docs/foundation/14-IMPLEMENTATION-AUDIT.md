# SWAPNO AI — Current Implementation Audit

**Status:** Source-checked on 2026-11-09<br>
**Scope:** Current local `main` checkout and the implementation changes in this phase<br>
**Supersedes:** Historical implementation claims in `01-PROJECT-AUDIT.md` and `02-EXISTING-ARCHITECTURE.md`; those documents remain unchanged for history.

## Executive summary

The project is a React/Vite sample application with an Express/TypeScript server and early authentication/workspace scaffolding. It is not yet a production SaaS. The browser experience is explicitly configured as a sample (`PUBLIC_DEMO_MODE = true` in `src/App.tsx`), while Vercel builds and serves only the static frontend. Render starts the Express server but sets production/demo flags that disable all `/api/*` routes. Local JSON persistence remains the active database implementation.

The current implementation adds server-side Gemini, Groq, and OpenRouter connection-test adapters and authenticated, explicit test endpoints. These are not a generation router. Tests use injected/mocked providers; no live provider request has been made.

## Current architecture and evidence

| Area | Current implementation | Assessment |
|---|---|---|
| Frontend | React 19 + TypeScript + Vite; app shell and sample workspaces in `src/App.tsx` and `src/data/workspaceData.ts` | Builds, but most state and feature workflows are sample/local state. |
| Express server | `server.ts` mounts auth, workspace, and AI provider routes; Vite middleware serves the app in development | Runs locally; API is intentionally disabled in production/demo mode by the `/api` middleware. |
| Vercel | `vercel.json` runs `npm run build:client` and publishes `dist` | Valid for the static sample only; it does not deploy Express APIs. |
| Render | `render.yaml` builds and starts the bundled Express app, sets `NODE_ENV=production` and `PUBLIC_DEMO_MODE=true` | Deploys a demo whose API routes are disabled; not a SaaS backend. |
| Authentication | `authService.ts` hashes passwords with bcrypt and signs JWTs; auth routes register/login/me/logout; the login UI calls the Express API and uses an HttpOnly cookie | Local development account flow exists, but it is custom auth backed by JSON. Registration does not verify email; no recovery/refresh lifecycle exists. Production/demo APIs are disabled. |
| Workspaces | Authenticated routes create/list workspaces and check membership in `requireWorkspace` | Useful application-level isolation scaffolding; not database-enforced tenant isolation. |
| Persistence | `DatabaseService` loads and writes `data/swapno_multi_tenant_db.json` synchronously | Local JSON is active persistence. Supabase client initialization does not replace these read/write paths. Not suitable for multi-instance production. |
| AI | Legacy `/api/ai/*` endpoints call Gemini with hard-coded model IDs and produce static/generated sample fallback content; image failure can return Unsplash imagery | Not reliable evidence of a working provider, and fallback content can appear as successful output. Account generation paths are blocked in the UI; existing routes are blocked in demo/production. |
| Provider foundation | `src/server/ai/providerRegistry.ts` registers Gemini, Groq, and OpenRouter connection tests; `GET /api/v1/ai/providers` reports configuration; `POST /api/v1/ai/providers/{gemini,groq,openrouter}/test` requires authentication, `confirm: true`, and provider-specific server opt-in | No automatic provider fallback. The health response never returns credentials. Real provider status remains unverified. |
| Trial and learning | Local JSON workspace creation assigns a configurable trial; an authenticated trial status route and saveable learning progress exist | Default policy is seven days/25 AI actions, but action accounting is not wired to real generation. The SQL policy draft is not applied. |

## Feature reality

**Implemented, but not end-to-end SaaS:** bcrypt/JWT auth service, workspace records and membership checks, local registration/login UI, workspace APIs, a local trial policy/status helper, saveable onboarding progress, tenant-isolation unit coverage, and explicit provider adapter/test contracts.

**Prototype or simulated:** public demo workspace switching, publishing and Meta connection, scheduling/queue indicators, demo analytics, PDF/export flows, much of Business Brain/research/strategy, and sample-mode AI interactions. These behaviors use local state, fixed sample data, mock timers, or canned content. They must not be presented as real external actions.

**Incomplete or not configured:** hosted auth/data integration (the local browser UI talks to the local custom auth API), email verification/recovery, production database and migrations/RLS, storage uploads, job queue/workers, actual OAuth/social publishing, real analytics, billing, provider usage limits, and production-grade AI generation.

## Security and production blockers

1. `src/App.tsx` hard-codes sample mode and embeds sample business data. Keep this isolated from real customer records.
2. The public Vercel deployment is frontend-only. Render's production/demo middleware disables APIs. Do not advertise either as an operational SaaS backend.
3. Persistent records are written to local JSON. There is no active PostgreSQL persistence or RLS enforcement; in-memory/query membership checks alone do not satisfy the master database-isolation requirement.
4. Local browser login calls the custom auth API, but the public deployment blocks all APIs. Server-side email verification/recovery and refresh-token rotation are absent.
5. Authentication uses a custom JWT and the local JSON database, not Supabase Auth or PostgreSQL.
6. Legacy AI routes have deceptive fallback behavior and outdated hard-coded model identifiers. The new provider tests are separate and do not make those routes production-safe.
7. Workspace writes accept validated client state and persist it to a shared local JSON file. The file is not appropriate for multiple server instances or customer data.
8. Legacy `/api/state` and `/api/reset` handlers remain in `server.ts` below middleware that currently returns HTTP 410 before they are reached. Remove the dead handlers to prevent accidental reactivation.
9. Provider keys shared in chat must be revoked/rotated before any use. No credential values are recorded in this audit.

## Verification evidence

- `npm run build`: passed; Vite client and Express bundle completed.
- `tsc --noEmit`: passed.
- Provider tests plus `trialService.test.ts`: 16 passed; provider calls were mocked.
- `tsx src/server/tests/tenant_isolation.test.ts` from an isolated temporary working directory: 28 passed. This covers local JSON behavior, not PostgreSQL/RLS.
- Isolated HTTP smoke test: `/healthz` returned `ok`, `/api/state` returned 410, and unauthenticated `/api/v1/auth/me` returned 401.
- Isolated registration/workspace HTTP flow: registration 201, products/goals read back, attempted client publication rejected 409, and a regular state update succeeded 200 using a temporary data directory.
- No live provider API request was performed.
- Existing tenant-isolation suite is a local JSON persistence check, not PostgreSQL/RLS evidence.
- The latest browser check inspected landing and account-creation/review copy at desktop/tablet/mobile widths; it did not create an account or validate authenticated dashboard behavior.

## Before a safe public demo

- Keep the public deployment sample-only and make simulated interactions clearly demonstrative; do not connect it to private data or a live provider key.
- Ensure publishing, OAuth, analytics, export, and AI failures never report success unless the external operation actually succeeded.
- Keep APIs disabled on the public sample until auth, persistence, and abuse protections are deployed.
- Configure and rotate secrets only through a private local environment or hosting dashboard.

## Before a customer SaaS launch

- Replace local JSON persistence with managed PostgreSQL, idempotent migrations, workspace-scoped queries, and enabled/tested RLS policies.
- Wire the browser to the real auth/session API; add email verification, password/session protections, rate limits, and safe auth responses.
- Implement durable object storage, background jobs, actual Meta OAuth/publishing, verified remote post IDs, and real analytics.
- Add AI quotas, cost attribution, provider error handling, structured output validation, and tenancy-aware audit logging.
- Test tenant isolation at the database layer and exercise all registration-to-publish journeys before describing the product as a SaaS.
