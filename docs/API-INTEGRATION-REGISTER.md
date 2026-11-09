# API Integration Register

**Last checked:** 2026-11-09

## Current Express endpoint inventory

All `/api/*` requests are blocked when `NODE_ENV=production` or `PUBLIC_DEMO_MODE=true`. In local development, the following routes are mounted:

| Method and path | Auth / validation | Purpose and limitations |
|---|---|---|
| `GET /healthz` | Public | Process liveness and mode only; not a database readiness check. |
| `POST /api/v1/auth/register` | Public; Zod validation | Creates a local JSON-backed user/workspace and HttpOnly cookie. No email verification. |
| `POST /api/v1/auth/login` | Public; Zod validation, auth rate limit | Local custom JWT login. |
| `GET /api/v1/auth/me` | Authenticated cookie or bearer token | Returns local user and workspaces. |
| `POST /api/v1/auth/logout` | Public | Clears the local auth cookie. |
| `GET /api/v1/workspaces` | Authenticated | Lists the current user's local workspaces. |
| `POST /api/v1/workspaces` | Authenticated; Zod validation | Creates a local workspace. |
| `GET /api/v1/workspaces/:workspaceId` | Authenticated; membership checked | Reads workspace and membership. |
| `GET /api/v1/workspaces/:workspaceId/trial` | Authenticated; membership checked | Reads server-derived local trial status. |
| `GET /api/v1/workspaces/:workspaceId/state` | Authenticated; membership checked | Reads full workspace domain state. |
| `PUT /api/v1/workspaces/:workspaceId/state` | Authenticated; owner/admin/editor; bounded Zod schema | Writes local JSON workspace state. A client cannot introduce a `published` status; a publication flow is not implemented. Existing published items may remain unchanged in state. |
| `POST /api/v1/workspaces/:workspaceId/memory-log` | Authenticated; owner/admin/editor; Zod validation | Adds local Business Brain memory entry. |
| `GET /api/v1/ai/providers` | Authenticated | Returns adapter configuration/readiness only. |
| `POST /api/v1/ai/providers/:providerId/test` | Authenticated; `{ "confirm": true }`; provider-specific explicit environment opt-in | One connection-test request for `gemini`, `groq`, or `openrouter`; potentially consumes provider quota. |

Legacy sample endpoints are also registered in local development:

| Method and path | Notes |
|---|---|
| `GET /api/state`, `POST /api/state`, requests under `/api/reset` | An earlier middleware returns HTTP 410 (`LEGACY_API_DISABLED`) before the old handlers. The dead handlers remain later in `server.ts` but are not reached with the current middleware order. Remove the dead code to avoid accidental reactivation. |
| `POST /api/ai/chat`, `/api/ai/brainstorm`, `/api/ai/research`, `/api/ai/strategy`, `/api/ai/plan`, `/api/ai/generate-content`, `/api/ai/generate-image` | Legacy sample endpoints require auth middleware but may return canned/simulated fallback results. Not part of the provider registry and not production account generation. |

The route list is source-derived. It is not a claim that the routes are hosted or exposed in the public deployment.

| Integration | Current status | Entry point / contract | Secrets or owner setup | Safety notes |
|---|---|---|---|---|
| Supabase Auth | Not wired to the app; custom local auth remains active | Planned signup, sign-in, email verification, refresh, sign-out, password recovery | Create project; configure email provider, confirmation/recovery redirect URLs, and SMTP/delivery as needed | Hosted Supabase email service has limits; no credentials in chat. |
| Supabase PostgreSQL | Client object is initialized but unused for app reads/writes | Planned migrations under `supabase/migrations/` and RLS-scoped requests | Project URL + publishable/anon key; never use service role in normal requests | New migration is not applied; RLS tests and repository implementation remain required. |
| Gemini | Adapter and authenticated explicit test route implemented | `GET /api/v1/ai/providers`, `POST /api/v1/ai/providers/gemini/test` | Server-only `GEMINI_API_KEY`; intentional `GEMINI_LIVE_TEST_ENABLED=true` required | No live success verified; endpoint disabled in public production/demo. |
| Groq | Server-side connection-test adapter; live test remains disabled unless explicitly enabled | `GET /api/v1/ai/providers`, `POST /api/v1/ai/providers/groq/test` | Server-only `GROQ_API_KEY`, model, and `GROQ_LIVE_TEST_ENABLED=true` | Test only; current provider rate limits are account/org-specific; free usage is not guaranteed universally. |
| OpenRouter | Server-side connection-test adapter; rejects model IDs without `:free`; live test remains opt-in | `GET /api/v1/ai/providers`, `POST /api/v1/ai/providers/openrouter/test` | Server-only `OPENROUTER_API_KEY`, `OPENROUTER_MODEL_ID` ending in `:free`, and `OPENROUTER_LIVE_TEST_ENABLED=true` | Test only; free plan has 50 requests/day; no generation fallback is implemented. Review provider routing and privacy before any future use. |
| Together AI | Evaluated only | Serverless inference pricing/API | No key configured | Pricing page shows metered inference; not enabled. |
| OpenAI | Evaluated only | API integration not added | No key configured | Treat as paid; not enabled or eligible for fallback. |
| Meta OAuth/publishing | Not implemented; UI simulation only | No real OAuth callback or Graph API adapter | Meta developer app and reviewed permissions would be required | Never mark connected/published without verified remote identity/post ID. |
| Object storage | Not implemented for customer assets | Sample images use static URLs | Choose and configure private storage only after data model/security review | Existing local assets are not production storage. |
| Background queue | Selected for evaluation: Supabase Queues/pgmq | No worker or queue calls exist yet | Enable supported extension in Supabase and deploy a consumer after owner approval | No queue has been created; never expose queue operations to browsers. |

## Official provider sources

- [Gemini API models](https://ai.google.dev/gemini-api/docs/models/gemini), [pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Groq OpenAI compatibility](https://console.groq.com/docs/openai), [models](https://console.groq.com/docs/models), [rate limits](https://console.groq.com/docs/rate-limits)
- [OpenRouter models](https://openrouter.ai/docs/guides/overview/models), [pricing/free plan](https://openrouter.ai/pricing), [provider routing](https://openrouter.ai/docs/guides/routing/provider-selection)
- [Together AI pricing](https://www.together.ai/pricing)
- [Supabase Postgres RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [password auth](https://supabase.com/docs/guides/auth/passwords), [Postgres connections](https://supabase.com/docs/guides/database/connecting-to-postgres), [Queues](https://supabase.com/docs/guides/queues)
