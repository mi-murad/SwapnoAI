# Environment Variables

`.env.example` is the key-name template; `.env` must remain local and untracked. Never copy secrets to browser variables (`VITE_*`) or documentation.

| Name | Used by | Default / status | Notes |
|---|---|---|---|
| `PORT` | Express | `5000` | HTTP listen port. |
| `NODE_ENV` | Express/auth/cookies | unset in local dev; production hosting sets it | **Any** value `production` currently disables API routes and requires `JWT_SECRET`. |
| `PUBLIC_DEMO_MODE` | Express | unset/false in local dev | `true` also blocks all `/api/*`; Render sets it true. |
| `JWT_SECRET` | local custom auth | development has an insecure built-in secret; required in production process | Use a long unique random secret in private host settings. Do not rely on the development fallback. |
| `FRONTEND_ORIGINS` | Express CORS | local exact origins when unset; empty allowlist in production when unset | Comma-separated exact origins; credentialed requests are enabled. |
| `TRUST_PROXY_HOPS` | Express | `0` | Set only to the hosting provider's documented number of proxy hops. |
| `AUTH_COOKIE_SAME_SITE` | auth cookies | `lax` | `none` is honored only in production and requires HTTPS; cross-site restrictions still apply. |
| `VITE_API_BASE_URL` | Vite frontend | empty/same-origin | Public API origin compiled into the client. Never put credentials here. |
| `GEMINI_API_KEY` | server legacy AI and provider test | unset | Server-only; live connection tests still require `GEMINI_LIVE_TEST_ENABLED=true`. |
| `GEMINI_MODEL_ID` | provider test | `gemini-3.5-flash-lite` | Model/cost availability is account-dependent. |
| `GEMINI_LIVE_TEST_ENABLED` | provider test | `false` | Allows explicit test requests only, not account generation. |
| `GROQ_API_KEY`, `GROQ_MODEL_ID`, `GROQ_LIVE_TEST_ENABLED` | Groq connection test | unset / `false` | Server-side; opt-in; cost/quota is account-specific. |
| `OPENROUTER_API_KEY`, `OPENROUTER_MODEL_ID`, `OPENROUTER_LIVE_TEST_ENABLED` | OpenRouter connection test | unset / `false` | Server-side; explicit tests reject non-`:free` model IDs, but that does not guarantee availability or no indirect provider cost. |
| `AI_FREE_FALLBACK_ENABLED` | future design only | `false` | No automatic router/fallback currently reads this switch. |
| `TRIAL_DURATION_DAYS` | local trial helper | `7` | Whole number, 1–3650; new workspace window only. |
| `TRIAL_AI_ACTION_LIMIT` | local trial helper | `25` | Whole number, 1–3650; usage is not wired to real generation. |
| `TRIAL_INCLUDED_AI_ACTIONS` | local trial helper | `adviser,research,strategy,text_content` | Allowed labels only; not an active production entitlement system. |
| `SUPPORT_CONTACT_URL` | trial status response | unset | If set, only `https:` or `mailto:` is returned. |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | optional client construction | unset | Supabase is not used for product reads/writes. Do not put a service-role key in normal application configuration. |

The `.env.example` previously carried `APP_URL`, which source did not read; it has been removed. Hosting configurations may add `NODE_VERSION` for Render independently of the app runtime.

**Required before real account hosting:** rotate compromised credentials, provision private values only in host settings, and do not set provider-live switches unless the owner explicitly approves a real potentially billable test.
