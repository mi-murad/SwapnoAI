# SWAPNO AI — AI Provider Foundation

**Status:** Initial Gemini adapter and explicit connection test implemented; live connection unverified<br>
**Date:** 2026-11-09

> This historical first-pass note covers Gemini. The current registry also has Groq and OpenRouter connection-test adapters. See `docs/AI-PROVIDER-MATRIX.md` and `docs/API-INTEGRATION-REGISTER.md` for the maintained provider status; no provider has been live-verified.

## Boundary and behavior

The provider code lives under `src/server/ai/`; it must not be imported by browser code. The current registry implements Gemini only. It has no automatic fallback to another vendor or mock output.

| Environment variable | Purpose | Default |
|---|---|---|
| `GEMINI_API_KEY` | Server-only Gemini credential | Unset |
| `GEMINI_MODEL_ID` | Model identifier selected for a test | `gemini-3.5-flash-lite` |
| `GEMINI_LIVE_TEST_ENABLED` | Explicit opt-in for one external test request | `false` |

`GET /api/v1/ai/providers` requires authentication and reports only whether the provider is unconfigured, configured-but-disabled, or ready for an explicit test. It does not verify network access or credentials and never returns a key.

`POST /api/v1/ai/providers/gemini/test` requires authentication, JSON `{ "confirm": true }`, a configured non-placeholder key, and `GEMINI_LIVE_TEST_ENABLED=true`. It sends one fixed, short prompt with a small output cap. There is no retry or fallback. A provider failure returns an error rather than success-shaped sample output. The live test is disabled by default; enabling it can incur provider usage or cost.

The current production/demo middleware disables all API routes, and Vercel is configured as a frontend-only deployment. The endpoint is therefore not available in the current public deployments.

## Free-first and fallback policy

The registry is a transport/configuration foundation, not a model router. No second provider is enabled, and no "free" tier is assumed from a model name. Future routing should be explicit and policy-driven: require a configured provider, allow only user-requested work, enforce per-user/workspace quotas and budgets, and return a clear unavailable/error result when no allowed provider is available. Do not silently route to a potentially billable vendor or substitute generated/mock content.

Provider adapters should implement a common server-only contract for capability metadata, health/configuration, and generation. A future orchestrator can choose among adapters only after the owner sets an explicit policy and account-level safeguards are implemented. Keep external side effects (publishing, billing, OAuth) outside generic model fallback logic.

## Local test procedure

1. Set `GEMINI_API_KEY` privately in the server environment; do not paste it in chat or commit it.
2. Leave `GEMINI_LIVE_TEST_ENABLED=false` for routine development.
3. For an intentional live check, set `GEMINI_LIVE_TEST_ENABLED=true`, authenticate against a non-demo local server, and send `POST /api/v1/ai/providers/gemini/test` with `{ "confirm": true }`.
4. Disable the opt-in immediately after the test. Treat only a successful response from this endpoint as a live connection check; unit tests use an injected fake adapter and do not establish connectivity.

## Known gaps

- No Gemini credential is configured in the inspected environment, so provider authentication, model availability, quota, and billing behavior are unverified.
- This test endpoint is not a production health check and is not mounted through a public Vercel API.
- The legacy `/api/ai/*` routes still have their own model IDs and sample fallbacks; they are not yet routed through this registry.
- Production usage controls, per-tenant attribution, and provider-specific error taxonomy remain future work.
