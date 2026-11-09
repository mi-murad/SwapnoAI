# Changelog

Notable repository changes are recorded here. Dates refer to the current engineering work, not a production release.

## 2026-11-09 — Local SaaS foundation, onboarding, and handoff

- Added local Express registration/login/session and workspace-scoped state APIs using the existing JSON persistence layer.
- Added server-derived seven-day/25-action trial status and configuration helpers. Usage enforcement is not wired to real AI generation.
- Added opt-in provider connection-test adapters for Gemini, Groq, and OpenRouter. They are not a production generation router and have not been live-verified.
- Added the initial, unexecuted Supabase tenancy/RLS migration draft.
- Refined account setup, Business Profile review, adviser prompts, guided lessons, first-use checklist, trial UI, and honest unavailable states.
- Preserved optional products/goals when login validation loads workspace state and blocked client-authored transitions to `published` before a platform confirmation exists.
- Applied the user-provided Safety Orange palette to account UI and new workspace brand-color defaults: `#111111`, `#FFFFFF`, `#FF4F00`, and `#FFD400`. This is not confirmed as the official SWAPNO TECH identity.
- Added architecture, security, provider, integration, competitive UX, release, and Claude Code handoff documentation.
- Local lint/build/unit and temporary JSON tenant tests passed as documented in [PROJECT-STATUS.md](PROJECT-STATUS.md). No staging deployment or live provider test is claimed.

No production release is represented by this changelog.
