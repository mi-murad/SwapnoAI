# SWAPNO AI Staging Release Report

**Review date:** 2026-11-09<br>
**Decision:** Static public demo deployed; not ready for account-based staging/SaaS<br>
**Frontend deployment:** Yes — [https://swapno-ai.vercel.app/](https://swapno-ai.vercel.app/)<br>
**Backend/staging API:** None

## Summary

The static Vite frontend was published to the requested Vercel URL after commit `d9215fa70a8fb4eb93dcb83991b65633b5261388` was pushed to `main`. The page returned HTTP 200 and served the same content-hashed JS/CSS assets as the local production build. The fictional NiRBAAN sample opened successfully in the browser. This is a static public demo, not an account-based staging service: Vercel does not host Express, Render is configured with `PUBLIC_DEMO_MODE=true`, and production API requests are blocked. The application still persists local account data to JSON; Supabase is not the active application database.

Do not treat the public sample UI or successful local tests as evidence of working account, AI, database, or publishing features. Only the Vercel static frontend is deployed. No backend health endpoint, authentication, customer data persistence, or live AI route was verified. Vercel/Render CLIs and deployment credential variables were unavailable; the static site was verified directly over HTTPS after publishing to GitHub.

## Architecture and release findings

- **Frontend:** React/Vite; Vercel runs `npm run build:client` and publishes `dist`.
- **Backend:** Express/Node; Render runs the full `npm run build` and starts `dist/server.cjs`.
- **Production API behavior:** Render's current `PUBLIC_DEMO_MODE=true` disables account API routes. The Vercel static site has no configured backend API destination in the checked-in deployment configuration.
- **Persistence and authentication:** The active local account implementation uses custom authentication and `data/swapno_multi_tenant_db.json`. It is not a durable hosted database. Supabase client setup and an RLS migration draft exist, but the application is not using Supabase for reads/writes; the migration has not been applied or tested.
- **Trial:** Local server-side policy defaults to seven days and 25 actions, with no card or automatic charge. Usage display is server-derived, but the usage recorder is not connected to real generation. Trial enforcement against real customer operations is therefore not release-ready.
- **AI:** Provider connection-test adapters exist. Unit tests use mocked responses. No authenticated live provider request succeeded or was attempted during this verification, and account AI generation remains disabled.
- **Customer experience:** Production landing page and NiRBAAN sample workspace opened in the browser. At 390px mobile width, document width equaled viewport width (no horizontal overflow). Local signup/review/learning screens were also inspected at mobile, tablet, and desktop widths. The authenticated dashboard and full account journey have not received equivalent responsive acceptance coverage.
- **Brand:** The Canva reference requires sign-in in this environment. The user-provided Safety Orange palette (`#111111`, `#FFFFFF`, `#FF4F00`, `#FFD400`) is applied. No official logo artwork or confirmed font names were available in the repository; logo/font fidelity remains unverified.
- **GitHub:** The configured `origin` is the intended official repository. `main` was fast-forwarded and pushed to `d9215fa70a8fb4eb93dcb83991b65633b5261388`; that commit is present on the remote. The public site serves the matching local frontend asset hashes.
- **Final code review:** Identified and fixed two issues before handoff: the login response schema had stripped optional products/goals, and whole-state updates could newly mark content as `published`. Type-check/build and isolated account API smoke tests passed after these fixes.

## Verification run

| Check | Result |
|---|---|
| `npm run lint` (`tsc --noEmit`) | Passed |
| `npm run build` | Passed. Non-fatal Zod comment-annotation warnings and a 514.13 kB minified JavaScript chunk warning remain. |
| Trial and provider unit tests | 16 passed; provider behavior was mocked, with no live credentials or provider requests. |
| Local tenant/persistence test suite | 28/28 passed in a temporary directory. This exercises local JSON isolation, not PostgreSQL or RLS. |
| Isolated local Express smoke test | Registration, cookie delivery, server trial defaults, products/goals save, onboarding progress save/reload, cross-workspace denial, and logout/login passed. No external provider was contacted. |
| Isolated account API safety smoke test | Health `ok`; `/api/state` returned 410; unauthenticated `/api/v1/auth/me` returned 401; registration returned 201; products/goals persisted; new client `published` status returned 409; a normal state update returned 200. Temporary directory and test-only identity used. |
| Corrupt local JSON safety check | Passed; the unreadable source file was not overwritten. |
| `git diff --check` | Passed; Git emitted only line-ending conversion warnings. |
| UI inspection | Landing/signup/review and public-sample lesson surfaces checked at 390px, 768px, and 1440px. Lesson dialog Tab/Shift+Tab trapping and Escape dismissal worked. This is not a screen-reader audit or full authenticated-flow test. |
| Local final `npm run lint`, `npm run build`, `git diff --check` | Passed under available Node 20.18.0. Vercel build output emitted existing Zod annotation and >500 kB chunk warnings. |
| Vercel public URL | HTTPS page returned HTTP 200; title and JS/CSS hashes matched the local build output after the `main` update. |
| Deployed sample smoke test | NiRBAAN sample opened. At a 390px viewport, page width equaled viewport width. This did not test account flows, API connectivity, or browser console/server logs. |
| Vercel/Render configuration review | Vercel remains static-only; Render remains configured for demo mode. No backend deployment configuration was changed. |
| Hosting account access | Vercel/Render CLIs and deployment credential environment variables were unavailable; no deployment management dashboard or build logs were inspected. The deployed frontend was independently verified at the URL. |
| Live provider, PostgreSQL/RLS, backend deployment, staging account flow | Not tested/performed. |

## Blockers before a safe staging release

1. Revoke and rotate the credentials previously shared in chat. Configure replacements privately; never put them in source control or chat.
2. Select and provision a separate staging Supabase/PostgreSQL project, review the draft migration, apply it only to staging, and test RLS with at least two users.
3. Implement and verify the persistent repository and secure authentication lifecycle, including email verification, password recovery, session expiry, and server-side workspace/role checks.
4. Configure a real hosted backend and explicitly connect the Vercel frontend to it. Verify origin restrictions, cookies, CSRF defenses, health checks, shared rate limits, and production environment settings.
5. Connect trial authorization and atomic usage recording to every restricted operation before enabling account AI. Confirm expired trials preserve data and never charge automatically.
6. Complete authenticated account, expired-trial, responsive, keyboard, and screen-reader acceptance tests before inviting users.

## Next owner action

Revoke and rotate every credential previously pasted into chat from its provider dashboard. Do not send replacement credentials in chat. After rotation, create a separate Supabase staging project for the reviewed migration and two-user RLS verification.

For ongoing implementation status, see [PROJECT-STATUS.md](../PROJECT-STATUS.md) and [UX-AND-ONBOARDING.md](../UX-AND-ONBOARDING.md).
