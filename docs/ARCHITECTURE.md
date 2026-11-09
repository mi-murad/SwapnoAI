# SWAPNO AI — Current Architecture

## Runtime shape

```text
Browser
  ├─ React/Vite static UI (Vercel config publishes dist/)
  └─ development: same-origin Vite middleware + Express at :5000
       ├─ /api/v1/auth/*        local account auth
       ├─ /api/v1/workspaces/*  local membership-checked workspace JSON
       ├─ /api/v1/ai/providers/* explicit provider connection tests
       └─ /api/ai/*             legacy sample AI routes with canned fallbacks

Express -> data/swapno_multi_tenant_db.json (account API, local filesystem)
Legacy sample state -> db.json (separate local file; old `/api/state` handlers are unreachable behind a 410 middleware)
Supabase client/migration -> optional client setup / proposed schema only; not active persistence
```

## Frontend

React 19 and TypeScript are built with Vite. `src/api.ts` reads optional `VITE_API_BASE_URL` at build time and sends credentialed fetches. The app hard-codes a sample/demo mode, so account UI behavior should not be assumed available on static hosting.

## Backend

`server.ts` is the Express entry point. In development it attaches Vite middleware. A production build emits `dist/server.cjs` and serves the static client. The server applies exact-origin credentialed CORS, JSON body limits, and process-local rate limits. `GET /healthz` is a liveness response, not a database/readiness check.

`NODE_ENV=production` or `PUBLIC_DEMO_MODE=true` blocks `/api/*`. This includes the Render config. Do not remove that guard as a shortcut to enabling accounts.

The old `/api/state` and `/api/reset` handler implementations remain below middleware that returns `410 LEGACY_API_DISABLED`; they are not reached with the current middleware order and should be removed to avoid accidental reactivation.

## Authentication and authorization

Local routes use bcryptjs, a custom signed JWT and an HttpOnly `auth_token` cookie (7-day max age). Workspace routes verify JWT, membership, and role in server middleware. No Supabase Auth, email verification, password recovery, refresh rotation, or CSRF token is implemented.

## Data

`src/server/db/database.ts` reads/writes `data/swapno_multi_tenant_db.json` for user accounts and workspace records. `server.ts`'s legacy sample routes reference root `db.json`. Both are ignored local files; they are not safe hosted persistence. Supabase client initialization does not mean reads/writes use Supabase. Migration is a draft and untested.

## AI

`src/server/ai/providerRegistry.ts` contains explicit connection-test adapters. New provider tests are mocked. Older `server.ts` AI routes belong to the sample experience and may return canned outputs when a provider is missing/rate-limited. No account generation router, durable usage ledger, automatic fallback, or background job worker exists.

## Hosting topology

- Vercel: static frontend (`npm run build:client`, `dist`).
- Render: Node Express bundle (`npm run build`, `npm start`), but current blueprint runs production/demo mode, blocking APIs.
- PostgreSQL/Supabase: recommended target, not connected.

Detailed target request path and blockers: [backend deployment plan](BACKEND-DEPLOYMENT-PLAN.md).
The source-derived route inventory is in [API integration register](API-INTEGRATION-REGISTER.md).
