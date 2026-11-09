# Backend Deployment Plan

**Recommendation:** Vercel for the static React/Vite frontend; a persistent Render web service for the Express API; Supabase Auth/PostgreSQL for identity and durable data.<br>
**Status:** Existing public deployment remains sample-only; do not enable account APIs until database/Auth wiring is complete.<br>

## Existing configuration

- `vercel.json` runs `npm run build:client` and publishes `dist`. It does not deploy Express.
- `render.yaml` builds and starts the bundled Express server but sets `NODE_ENV=production` and `PUBLIC_DEMO_MODE=true`.
- `server.ts` blocks all `/api/*` requests when production/demo mode is active. `/healthz` is a process liveness response only.
- Current application persistence is local JSON. A normal ephemeral Render filesystem is not a production database.

## Target request path

`Browser (Vercel) -> HTTPS VITE_API_BASE_URL (Render Express API) -> Supabase Auth verification + scoped Postgres/RLS`

Keep the existing static Vercel deployment. Do not try to bundle the Express server into Vercel's static output. Configure a custom app/API domain under the same registrable domain where practical; cross-site cookie policies on default `*.vercel.app` and `*.onrender.com` hosts can make browser sessions unreliable.

## Configuration required before backend activation

| Variable | Where | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | Vercel build environment | Public API origin only, e.g. `https://api.example.com`; no secret. A Vite change requires a new frontend deployment. |
| `FRONTEND_ORIGINS` | Render | Exact comma-separated HTTPS origins allowed by CORS; no wildcard when cookies are enabled. |
| `TRUST_PROXY_HOPS` | Render | Set to the provider's documented proxy hop count before trusting forwarded client IPs. |
| `SUPABASE_URL` | Render | Server-side project URL. |
| `SUPABASE_ANON_KEY` | Render | Public project key; still server configuration, not a substitute for RLS. |
| Supabase Auth access/refresh tokens | HttpOnly API cookies or scoped bearer session | Choose and implement one session contract. Never return credentials in JSON or expose service role. |
| `AUTH_COOKIE_SAME_SITE` | Render | Use `none` only with HTTPS and a cross-site origin; custom same-site domains are preferable. Browser third-party-cookie restrictions still apply. |
| `PUBLIC_DEMO_MODE` | Render | Keep `true` until Supabase Auth/repository, migration, RLS tests, and account UI are verified. |

The server now has exact-origin credentialed CORS, 1 MiB JSON limit, and process-local API/auth/AI rate limits. These are defense-in-depth for a single instance, not distributed quotas. Before multiple instances, use a shared rate-limit store and explicit proxy configuration. The API remains blocked in production by design.

## Health and runtime

- `GET /healthz` currently proves that the Express process can answer. Add readiness checks for Supabase connectivity and migration version before enabling API traffic; never include connection strings or secrets in health output.
- Production API process: `npm start` after `npm run build`.
- Frontend build: `npm run build:client`; output directory `dist`.
- Vercel frontend and Render API origins must be configured and tested together for CORS, cookies, preflight, error handling, and auth expiration.
- Do not add a Render disk for relational data. Supabase PostgreSQL is the source of truth; backups and retention must be configured at the database provider.

## Long-running AI jobs

Evaluate **Supabase Queues (pgmq)** as the single initial durable queue: it is PostgreSQL-native and integrates with the recommended database. Supabase documents the Queues extension as available on PostgreSQL 15.6.1.143 or later; enable it in the project/dashboard and use a server-side consumer with retry/backoff, idempotency, and dead-letter/archival behavior. Do not expose queue functions/tables to browser clients.

Queue selection is an architecture decision, not an installed or deployed worker. No worker, queue extension, paid service, or customer-facing asynchronous AI job has been activated.
