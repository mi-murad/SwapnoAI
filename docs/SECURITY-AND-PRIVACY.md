# Security and Privacy

**Status:** Architecture and local hardening in progress; not production-ready.

## Implemented in the current branch

- Provider keys are read server-side; the Gemini test is protected by authentication, an explicit request confirmation, and a default-off environment switch.
- New provider tests verify that failures are not converted into generated fallback content.
- API requests now have a 1 MiB JSON body cap, exact-origin credentialed CORS, API/auth/AI rate limits, and explicit production proxy-hop configuration.
- Authentication responses no longer include the custom JWT in their JSON body; the token is delivered via HttpOnly cookie. Cookie SameSite is configurable and Secure is set in production.
- The production/demo server configuration still blocks all APIs. This is intentionally retained until persistent storage/auth is ready.
- Workspace JSON-state writes require owner/admin/editor membership and are checked against a bounded Zod schema. This applies to the current local JSON API only; PostgreSQL RLS remains a draft.
- Workspace state updates reject client attempts to newly mark content as published; a future trusted publishing route must verify a platform result. This does not implement publishing.
- Local `data/`, `db.json`, and `.env` files remain excluded from Git. No local database, credential, upload, or private user-data files are included in the handoff changes.

## Current blockers and privacy risks

1. Product and auth records still use local JSON; data can be lost on ephemeral hosting and does not have database RLS.
2. The custom JWT/local auth is not integrated with Supabase Auth, email verification, refresh-token rotation, or password recovery.
3. The current API is disabled in production/demo. Enabling it before Supabase repository and RLS verification would expose local JSON-backed flows.
4. The frontend remains a fictional sample; publishing, OAuth, analytics, and some AI UI flows must remain clearly labeled as simulated.
5. Legacy AI routes have canned error fallbacks and old model identifiers. The new provider registry is separate and does not make those routes production-safe.
6. Rate limiting is process-local. Multiple server processes need a shared store; current limits are not tenant quotas or durable AI budgets.
7. Default Vercel and Render hosts are cross-site. Cookie behavior can be blocked by browser privacy controls; use HTTPS and a same-site custom domain or adopt a reviewed bearer/session design.
8. The proposed migration is not applied and its RLS behavior has not been exercised on a Supabase project. It restricts workspace data writes by role and prevents authenticated clients from forging AI usage/audit records, but this remains unverified until integration tests run against Supabase.
9. Legacy `/api/state` and `/api/reset` handlers remain in `server.ts` below middleware that currently returns HTTP 410 before reaching them. Remove the dead handlers to prevent accidental reactivation during future refactoring.
10. All credentials previously shared in chat should be revoked and rotated. This document contains no credential values.

## Required controls before handling customer data

- Apply reviewed migrations, verify RLS with two real test accounts, and use only scoped user tokens for tenant requests.
- Use verified email and password recovery through Supabase Auth, strict redirect allowlists, rate limits, session expiration/refresh, and generic authentication failure messages.
- Enforce tenant and role authorization in every API endpoint in addition to RLS; derive actor/workspace IDs from verified session/membership, not arbitrary request bodies.
- Configure exact CORS origins, HTTPS, secure HttpOnly cookie policy, CSRF defenses for cookie-authenticated unsafe methods, and correct proxy trust.
- Add durable per-workspace AI usage/budgets, provider/model capability allowlists, timeouts, and paid-provider deny-by-default routing.
- Minimize prompts/telemetry, set retention/deletion policies, disclose vendor data processing, and never send secrets or unnecessary personal/customer data to model providers.
- Audit publishing and billing actions; mark content published only after a platform response includes a verified remote post ID.
- Configure database backups/restore tests, production alerts, dependency/secret scanning, and incident-response procedures.

## Privacy implications of free AI tiers

“Free” does not mean private or unrestricted. Google currently states that content from its free Gemini tier may be used to improve products; OpenRouter routes requests to third parties and its free plan lacks spend controls; provider terms/rate limits may change. Do not send customer or sensitive business data until the owner selects acceptable vendor data terms and retention settings.
