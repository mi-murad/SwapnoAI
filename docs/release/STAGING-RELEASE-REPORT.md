# SWAPNO AI Staging Release Report

**Review date:** 2026-11-09<br>
**Decision:** Not ready for staging deployment<br>
**Deployment performed:** No<br>
**Staging URL:** None

## Summary

The local Vite frontend and Express server bundle build successfully. The checked-in Vercel configuration builds and serves only the static frontend. Render is configured to start Express, but sets `PUBLIC_DEMO_MODE=true`, which deliberately blocks account APIs. The application still persists account data in a local JSON file; Supabase is not the active application database. These configurations do not yet provide a safe, persistent, authenticated staging product.

Do not treat the public sample UI, successful local tests, or static Vercel build as evidence of a working SaaS deployment. No deployment was started and no public URL is available. The Vercel and Render CLIs are not installed; no Vercel/Render deployment credential variables are available; no GitHub Actions workflows exist. A remote read-only check confirmed `main` currently points to the audited base commit; it did not provide hosting/deployment access.

## Architecture and release findings

- **Frontend:** React/Vite; Vercel runs `npm run build:client` and publishes `dist`.
- **Backend:** Express/Node; Render runs the full `npm run build` and starts `dist/server.cjs`.
- **Production API behavior:** Render's current `PUBLIC_DEMO_MODE=true` disables account API routes. The Vercel static site has no configured backend API destination in the checked-in deployment configuration.
- **Persistence and authentication:** The active local account implementation uses custom authentication and `data/swapno_multi_tenant_db.json`. It is not a durable hosted database. Supabase client setup and an RLS migration draft exist, but the application is not using Supabase for reads/writes; the migration has not been applied or tested.
- **Trial:** Local server-side policy defaults to seven days and 25 actions, with no card or automatic charge. Usage display is server-derived, but the usage recorder is not connected to real generation. Trial enforcement against real customer operations is therefore not release-ready.
- **AI:** Provider connection-test adapters exist. Unit tests use mocked responses. No authenticated live provider request succeeded or was attempted during this verification, and account AI generation remains disabled.
- **Customer experience:** Signup/review and sample learning screens were inspected at mobile, tablet, and desktop viewport widths. No horizontal overflow was observed in those inspected screens. The authenticated dashboard and full account journey have not received equivalent responsive acceptance coverage.
- **Brand:** The Canva reference requires sign-in in this environment. The user-provided Safety Orange palette (`#111111`, `#FFFFFF`, `#FF4F00`, `#FFD400`) is applied. No official logo artwork or confirmed font names were available in the repository; logo/font fidelity remains unverified.
- **GitHub:** The configured `origin` is the intended official repository. `main` was not changed during deployment investigation. No deployment has been triggered by this work.
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
| Vercel/Render configuration review | Vercel remains static-only; Render remains configured for demo mode. No deployment configuration was changed. |
| Hosting account access | Vercel/Render CLIs unavailable, no deployment credential environment variables, and no Actions workflow; deployment could not be initiated or verified. |
| Live provider, PostgreSQL/RLS, staging deployment | Not tested/performed. |

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
