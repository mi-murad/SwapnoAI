# SWAPNO AI UX, Brand, Trial, and Onboarding Status

**Status:** First implementation pass; customer-facing account flows remain incomplete and are not production-ready.

## Brand reference

- The supplied Canva reference requires sign-in in this environment, so the complete document and original artwork could not be inspected.
- The user supplied a Safety Orange palette image and its four colors are now applied to the account-facing experience: Pure Black `#111111`, Crisp White `#FFFFFF`, Safety Orange `#FF4F00`, and Cyber Yellow `#FFD400`.
- The image is a palette reference, not proof of SWAPNO TECH's official identity; the Canva document remains unavailable for verification.
- No official logo artwork or confirmed font names were found in the repository. The existing Space Grotesk, Inter, and JetBrains Mono fonts are retained but are not claimed to be official brand fonts.
- The login header identifies SWAPNO AI as a SWAPNO TECH product without drawing or substituting for official logo artwork.

## Implemented in this pass

- **Login and registration:** removed fictional business prefill; optional business details, products/services, and goals are reviewable before creation; the product/parent-brand relationship is stated without an invented logo.
- **First-use overview:** added a six-step progress checklist and made the Marketing Adviser the primary account-workspace starting point.
- **Learning:** added ten short lessons covering welcome, business profile, Business Brain, Adviser, research, strategy, calendar, content, social connections, and trial usage. Lessons are skippable, resumable, replayable individually, keyboard-dismissable with dialog focus management, and saved with workspace state.
- **Business Profile:** replaced internal jargon with plain labels and examples; added a deliberate review/approval action; edits clear the prior approval.
- **Marketing Adviser:** added customer-language starter prompts and an explicit notice that account AI is not connected and prompts do not send requests or consume trial actions.
- **Trial and Usage:** added server-returned start/expiry dates, remaining time, allowed actions, consumed/remaining actions, no-card/no-charge messaging, and a configured support link only when available.
- **Empty and unavailable states:** account analytics and social connections do not show fabricated results; account workspaces do not display the demo image library or demo system/gateway settings.
- **Persistence feedback:** workspace state writes are serialized to preserve edit order and have a visible saving/saved/error status. Local database read/write failures are no longer reported as success or used to overwrite an unreadable existing database file.
- **Responsive/accessibility foundations:** key new controls have explicit labels, minimum touch sizing, status/live regions, focus styling, focus trapping in lessons, and reduced-motion handling.

## Trial policy

- Defaults are seven days, no payment card, no automatic charge, and 25 AI actions shared across Adviser, research, strategy, and text drafts.
- `TRIAL_DURATION_DAYS`, `TRIAL_AI_ACTION_LIMIT`, and `TRIAL_INCLUDED_AI_ACTIONS` configure the active local backend policy. Invalid values stop startup rather than silently changing the policy.
- Trial dates and limits are assigned by the backend at workspace creation. Existing JSON workspace data is retained and old records receive missing trial metadata in memory.
- The action-recording helper is not connected to a live AI generation route. Account AI is disabled, so the truthful current usage is zero. Do not enable generation until access checks and usage recording are integrated and tested.
- The migration stores a private platform trial policy and assigns its values to workspaces, but it has not been applied and the Supabase repository/authentication is not connected.

## Remaining gaps and verification

- The account backend still uses local JSON and custom authentication. Onboarding/trial state is not backed by Supabase or PostgreSQL RLS.
- Trial state is not included in the live schema implementation, and action quotas are not atomically reserved/recorded around a real provider request.
- Strategy, calendar, and content modules still contain demo-oriented functionality. Account generation/publishing paths are blocked, but the complete account workflow has not been rebuilt or acceptance-tested.
- Account brand image upload/storage, social OAuth, publishing, verified analytics, email verification, and password recovery are unavailable.
- Browser inspection covered the landing/signup/review and public-sample lesson surfaces at 390px, 768px, and 1440px, but not the authenticated account dashboard across those widths. Acceptance tests still do not cover a new account completing the full journey, skipped/completed/returning onboarding, expired trial, full-page keyboard focus order, or screen-reader announcements.
- No cross-tenant Supabase/RLS test has run. The local tenant tests do not establish PostgreSQL isolation.
- Production API enablement and deployment are out of scope until authentication, database, usage enforcement, and external-effect integrations are complete.

## Latest verification

- The registration/review UI was inspected in a local browser at 390px, 768px, and 1440px widths. No horizontal overflow was measured, and the products/goals fields and review-before-create state were present. Account creation was not submitted from the browser.
- The lesson list and modal were inspected in the public sample at 390px. Focus moved into the dialog, Tab/Shift+Tab stayed inside it, Escape closed it, and no horizontal overflow was measured.
- A local isolated Express smoke test verified registration, HttpOnly cookie delivery, server trial defaults, products/goals persistence, learning-progress save/reload, logout/login, and cross-workspace denial. It did not contact external providers.
- Build, type-check, tests, staging deployment, and PostgreSQL/RLS evidence are recorded in `docs/PROJECT-STATUS.md` and `docs/release/STAGING-RELEASE-REPORT.md`.
- The full authenticated account dashboard, expired-trial UI, real screen-reader behavior, and live provider generation remain untested.
