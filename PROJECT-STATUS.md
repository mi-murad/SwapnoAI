# SWAPNO AI — Current Project Status

**Last verified:** 2026-11-09<br>
**Repository:** `https://github.com/mi-murad/SwapnoAI`<br>
**Base branch:** `main`<br>
**Base commit:** `bdc4bd990ddb3f994bd2d2423924469467d7bab7`<br>
**Handoff branch:** `claude/handoff-2026-11-09` (pushed to `origin`)<br>
**Stage:** Static public demo deployed; the product is not production-ready as an account-based SaaS.

The npm package metadata still uses the generic name `react-example` and version `0.0.0`; this is repository hygiene debt and not a runtime dependency.

## Verified implementation

| Area | Actual state |
|---|---|
| UI | React 19/Vite, fictional sample mode and a login/account UI. New customer-facing brand color tokens, onboarding lessons/checklist, Business Profile inputs, and trial display exist. Account experience is not fully acceptance-tested. |
| Authentication | Express routes for local registration/login/current-user/logout, bcrypt password hashes, 7-day custom JWT delivered in HttpOnly cookie. No verification email, password recovery, token rotation, or Supabase Auth. |
| Persistence | Main account API persists to ignored `data/swapno_multi_tenant_db.json`. Legacy demo routes reference ignored root `db.json`. Neither is a hosted database. |
| Workspace isolation | Local membership and role authorization on workspace APIs; local JSON tests pass. No database RLS is active; not sufficient proof for production multi-tenancy. |
| Legacy sample API | `/api/state` and `/api/reset` return HTTP 410 before old legacy handlers; the unreachable handlers remain dead code and should be removed. Production/demo mode also blocks all `/api/*`. |
| Trial | Server defaults: 7 days, 25 actions, no card and no automatic charge. Status endpoint is server-derived. Usage helpers are not wired to real AI operations; generation is disabled for account workspaces. |
| AI | Separate Gemini/Groq/OpenRouter connection-test registry; live calls require per-provider explicit flags. No live provider success verified. Legacy sample endpoints contain simulated/canned fallbacks in development and must not be presented as reliable AI. |
| Integrations | Social OAuth, actual publishing, persistent asset storage, verified analytics, email lifecycle, and background workers are not implemented. |
| Hosting | [Public Vercel demo](https://swapno-ai.vercel.app/) serves the static frontend. No backend or staging API is deployed; Render config sets demo mode and production Express blocks `/api/*`. |
| Brand | User-provided palette applied; official brand source remains unverified. No official logo artwork or exact font confirmation was found. |

## Verification actually completed

- `npm run lint` — passed (`tsc --noEmit`).
- `npm run build` — passed; non-fatal Zod annotation warnings and a 514 KB minified JS chunk warning remain.
- Provider/trial tests — 16 passed; provider requests were mocked.
- Tenant/persistence tests — 28/28 passed using temporary local JSON; PostgreSQL/RLS not tested.
- Isolated local Express smoke test — registration, HttpOnly cookie, trial defaults, onboarding/business data persistence, login/logout, and cross-workspace denial passed.
- Additional isolated HTTP smoke test — `/healthz` returned `ok`, legacy `/api/state` returned 410, and unauthenticated `/api/v1/auth/me` returned 401.
- Isolated account API flow — registration returned 201, products/goals were returned after signup, attempted client publication returned 409, and a normal workspace save returned 200. Used temporary storage and test-only data.
- Code review fixes — login state validation now retains optional products/goals; workspace state updates reject new client-authored `published` statuses.
- Local UI inspections — signup/review/learning surfaces at 390, 768, and 1440 px; no horizontal overflow in inspected screens. This is not a full authenticated or screen-reader test.
- Published frontend check — `https://swapno-ai.vercel.app/` returned HTTP 200 and served the same JS/CSS asset hashes as the local production build after pushing commit `d9215fa70a8fb4eb93dcb83991b65633b5261388` to `main`. The public NiRBAAN sample opened successfully; at 390 px, page width matched viewport width. This validates only the static demo, not API or account workflows.
- `git diff --check` — passed at last verification; line-ending warnings only.
- No staging backend, live provider request, database migration, production migration, or deployed customer-account flow was tested.

For detailed history, see [docs/PROJECT-STATUS.md](docs/PROJECT-STATUS.md). For current deployment status, see [docs/release/STAGING-RELEASE-REPORT.md](docs/release/STAGING-RELEASE-REPORT.md).

## Blocking items

1. Rotate all credentials previously pasted into chat.
2. Create and secure an owner-approved staging database; review migration and verify RLS with two users.
3. Implement Supabase Auth/repository and safe backend hosting/API origin.
4. Connect trial authorization and atomic accounting to real AI operations before enabling generation.
5. Complete authenticated, expired-trial, responsive, keyboard and screen-reader acceptance tests.
6. Only then enable a staging account API and consider customer-data trials.
