# AI Provider Matrix

**Status:** Server-side Gemini, Groq, and OpenRouter connection-test adapters and explicit test gates exist; no provider is live-verified.<br>
**Policy:** All provider calls must be server-side, opt-in, quota-attributed, and fail visibly. No paid provider is an automatic fallback.

Provider documentation and pricing pages were checked on 2026-11-09. Model availability, pricing, privacy, free quotas, and terms can change; re-check them before enabling production traffic.

| Provider | API integration | Free eligibility / cost boundary | Current decision |
|---|---|---|---|
| Gemini Developer API | Existing `@google/genai` SDK adapter; explicitly gated connection-test request | Google's current pricing page describes free-tier access for limited models, but availability/limits are account/model-dependent. It says free-tier content can be used to improve products. Other models/tools may be paid. | Keep test opt-in. Never infer free pricing from a model name. Confirm model-specific price and data policy before generation. |
| Groq | Server-side OpenAI-compatible connection-test adapter at `https://api.groq.com/openai/v1`; explicit test switch required | Limits are account/model-specific and visible in the Groq console. The public docs checked do not provide a universal zero-cost guarantee for every account/model. Hitting quota returns 429; this is not proof every request is free. | Test adapter only; do not designate it as a guaranteed-free automatic fallback. |
| OpenRouter | Server-side OpenAI-compatible connection-test adapter at `https://openrouter.ai/api/v1`; explicit test switch and a selected model ID ending in `:free` required | Free plan lists 25+ free models and 50 API requests/day. Only a selected model explicitly ending in `:free` is eligible for a free-only route; free plan lacks budget/spend controls. A `:free` model can be unavailable or throttled. | Test adapter only. No generation router or auto-fallback is implemented. |
| Together AI | OpenAI-compatible server-side API is available | Current pricing lists per-token metered services and some model-specific free pricing; this does not establish a general free quota. | Evaluated, not implemented or enabled. Requires explicit price/account policy before use. |
| OpenAI | Official API usage is metered; no free use is assumed | An API key/account may have billing/credits; no verified free entitlement for this project. | Evaluated, not implemented or enabled; never an automatic fallback. |

## Model capabilities and routing policy

Expose capabilities as server-owned metadata, not frontend guesses: `text_generation`, `structured_output`, `vision`, `image_generation`, context/output limits, stream support, and billing class. The initial text adapter must not advertise image, web search, JSON schema, or tool support unless it is verified for that model.

Fallback eligibility must require all of:

1. A user-initiated operation and explicit fallback permission.
2. A provider/model verified free-only by policy (OpenRouter `:free` model; no implicit upstream paid route).
3. A healthy provider not in quota cooldown.
4. Remaining application/workspace quota and a durable usage record.
5. No provider/transport fallback that silently changes billing class or data-retention policy.

HTTP 429 should use `Retry-After` when supplied and set a bounded provider/model cooldown. Timeouts must abort the network request where supported. Do not retry the same request indefinitely. Current registry verification endpoints are tests, not a production orchestrator, and do not persist usage to `ai_usage_events`.

## Required environment variable names

| Variable | Default | Effect |
|---|---|---|
| `GEMINI_API_KEY` | unset | Server-only Gemini credential. |
| `GEMINI_MODEL_ID` | configured model | Selected Gemini model; price must be verified before use. |
| `GEMINI_LIVE_TEST_ENABLED` | `false` | Allows one explicit Gemini test request only. |
| `GROQ_API_KEY` | unset | Server-only Groq credential; not added to browser/Vite env. |
| `GROQ_MODEL_ID` | unset | Must name a currently available model in the account. |
| `GROQ_LIVE_TEST_ENABLED` | `false` | Separate explicit test switch; does not certify free usage. |
| `OPENROUTER_API_KEY` | unset | Server-only OpenRouter credential; configure a strict provider-side key limit. |
| `OPENROUTER_MODEL_ID` | unset | Must use a current `:free` model for free-only policy. |
| `OPENROUTER_LIVE_TEST_ENABLED` | `false` | Separate explicit test switch. |
| `AI_FREE_FALLBACK_ENABLED` | `false` | Future router opt-in; no fallback is active today. |

Never place provider keys in `.env.example` with real values or in any `VITE_*` variable.
