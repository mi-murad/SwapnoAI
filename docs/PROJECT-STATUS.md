# SWAPNO AI — Project Status

**Last verified:** 2026-11-09
**Repository:** `mi-murad/SwapnoAI`, branch `main`
**Current stage:** Static public demo is deployed; the account-based SaaS is not production-ready.

## Current state

| Workstream | Status |
|---|---|
| Local authentication UI | Registration/login and workspace state use the Express API and HttpOnly cookie in development. Authentication is custom and backed by local JSON; production/demo API routes are disabled. |
| Email identity lifecycle | Email verification, recovery, and refresh-token rotation are not implemented. |
| Database | Application reads/writes still use `data/swapno_multi_tenant_db.json`; corrupt/read failures now stop startup without overwriting the original file. The Supabase client is initialized but unused. |
| Tenant migration | Additive Supabase schema/RLS draft now includes workspace trial policy and a secure workspace-creation function; not applied or tested against PostgreSQL. |
| Provider foundation | Server-side Gemini, Groq, and OpenRouter connection-test adapters are registered. Tests use mock clients; no provider has been live-verified. |
| AI generation/fallback | No production provider generation router or persistent usage ledger is active. Trial counting helpers exist but are not wired to real AI operations. Paid providers are not automatic fallbacks. |
| Trial and learning UX | Seven-day/25-action policy is server-configurable for the local JSON backend. Dates/status are server-calculated; account AI is disabled, so usage remains zero. Onboarding progress is saved with workspace state. |
| Deployment | [Vercel public demo](https://swapno-ai.vercel.app/) serves the static frontend. Render remains in public demo mode, and production APIs are intentionally blocked. No hosted backend/staging API is connected. |
| UI integrations | Account overview, Adviser, profile, trial, and learning surfaces are improved. Publishing, OAuth, analytics, and some AI flows remain simulated or unavailable; do not treat them as live integrations. |

## Implemented in this phase

- Added the initial multi-tenant schema for profiles, workspaces/memberships, business profile/Brain, research, strategy, calendar/content, assets, AI usage, and audit records.
- Drafted RLS policies that allow members to read workspace data, editors/admins/owners to create or update it, and owner/admin to delete it. Workspace ownership and plan fields cannot be changed through the authenticated SQL grant. Authenticated clients cannot write accounting or audit records, nor directly mark content published.
- Connected the existing registration/login UI to the existing custom Express API, with cookie-based sessions and workspace-scoped state routes. Workspace writes now require owner/admin/editor, and state updates are validated. This improves the local flow but does not make production account APIs safe to enable.
- Added server-side Groq and OpenRouter explicit connection-test adapters. OpenRouter test requests require a model ID ending in `:free`; neither is an automatic fallback.
- Added exact-origin credentialed CORS, JSON size limits, and process-local API/auth/AI rate limits. The production/demo API block remains in place.
- Added the initial 7-day, 25-action trial policy and a guided ten-lesson learning experience with a six-step first-use checklist. Usage actions are not connected to AI generation.
- Updated account onboarding/profile fields for products and goals, removed sample business/strategy defaults from new workspaces, and made account dashboard/settings/analytics states more truthful.
- Added customer-facing save status and guarded local JSON persistence against overwriting unreadable files.
- Created the requested database, deployment, provider, integration, security, UX/onboarding, and competitive UX documents.

## Verification actually run

- `npm run lint` — passed; this script runs `tsc --noEmit`.
- `npm run build` — passed; Vite emitted non-fatal dependency annotation and >500 kB chunk warnings, and the Express server bundle completed.
- `tsx --test src/server/tests/trialService.test.ts src/server/tests/aiProviderRegistry.test.ts src/server/tests/openAICompatibleProvider.test.ts` — 16 passed, using mocked provider behavior; no live provider call was made.
- `src/server/tests/tenant_isolation.test.ts` — 28/28 passed in a temporary working directory; this verifies local JSON behavior, not PostgreSQL RLS.
- `git diff --check` — passed; only Git line-ending conversion warnings were reported.
- Isolated local Express smoke test passed registration (201), HttpOnly cookie delivery, 7-day/25-action trial response, product/goal profile persistence, onboarding progress save/reload, cross-tenant denial (403), and logout/login (200). No external provider call was made.
- A separate isolated API smoke test confirmed health `ok`, legacy `/api/state` 410, unauthenticated `/api/v1/auth/me` 401, registration 201, products/goals persistence, client-published content rejection (409), and normal state save 200.
- A corrupt-JSON safety check confirmed the original local database file remains unchanged when startup rejects unreadable JSON.
- The SQL migration was not executed; no authorized staging database was used for migration or RLS testing.
- Landing, signup, review, and public-sample learning screens were inspected in a local Vite browser at 390px, 768px, and 1440px; no horizontal overflow was measured. Lesson focus, Tab/Shift+Tab trapping, and Escape dismissal were checked. No authenticated-account, expired-trial, or screen-reader acceptance test was performed.
- After commit `d9215fa70a8fb4eb93dcb83991b65633b5261388` was pushed to `main`, the public Vercel page returned HTTP 200 and served the same JS/CSS asset hashes as the local production build. The NiRBAAN sample opened; at 390px page width equaled viewport width. These checks cover only the static demo, not API or account workflows.
- Commit `d9215fa70a8fb4eb93dcb83991b65633b5261388` is on `main` and `origin/main`; the worktree is clean.

## Critical remaining blockers

1. Implement Supabase Auth and a persistent Postgres repository; verify email confirmation, recovery, session lifecycle, and workspace RLS with at least two real staging users.
2. Resolve how authenticated API requests will use scoped Supabase access tokens and ensure server-side workspace/role authorization on every route.
3. Keep production APIs disabled until persistent storage/auth, cross-origin cookie behavior, CSRF defenses, and shared rate limits are verified.
4. Implement durable AI usage/quota recording before any customer generation; connection-test adapters do not provide generation or fallback.
5. Keep publishing/OAuth, object storage, analytics, and background jobs disabled until real integrations and verified external effects exist.
6. Rotate all credentials previously exposed in chat; configure replacements only in private provider dashboards and server environment settings.

## Next owner action

Revoke and rotate every provider/infrastructure credential previously pasted into chat from its provider dashboard; do not share replacement credentials in chat. Then create a separate Supabase staging project for migration and two-user RLS tests.
