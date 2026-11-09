# Claude Code Handoff — SWAPNO AI

**Prepared:** 2026-11-09<br>
**Official repository:** `https://github.com/mi-murad/SwapnoAI`<br>
**Base branch:** `main`<br>
**Base commit observed:** `bdc4bd990ddb3f994bd2d2423924469467d7bab7`<br>
**Handoff branch:** `claude/handoff-2026-11-09` (pushed to `origin`; verify the latest tip before starting). Do not assume `main` contains this handoff.<br>
**Deployment:** No verified staging frontend/backend URL. No deployment was performed during this work.

## 1. Product and target

SWAPNO AI is intended to be a guided marketing partner for business owners. The target product learns the owner's approved business profile, then supports research, strategy, content planning, draft review, and eventually owner-approved publishing and analytics. The current repository is an early prototype with sample experiences and local foundations—not a launched multi-tenant SaaS.

## 2. Current architecture

- React 19 + TypeScript + Vite 6 + Tailwind CSS 4 frontend.
- Express 4 + Node.js 24 backend (`server.ts`), Vite middleware locally, esbuild bundle for hosted Node.
- Main account data store: ignored local file `data/swapno_multi_tenant_db.json`.
- Legacy/sample server-state file: ignored root `db.json`.
- Local auth: bcrypt hashes, custom JWT, HttpOnly cookie; membership/role checks in workspace middleware.
- Optional Supabase client initialization exists but is not used for product reads/writes. The SQL migration is draft-only and has never been applied.
- Vercel config builds/publishes static `dist`; Render blueprint starts Express but sets production/demo mode, which blocks APIs. There is no verified frontend-to-backend staging connection.

Read [architecture](../ARCHITECTURE.md), [deployment guide](../DEPLOYMENT-GUIDE.md), and [database status](../DATABASE-AND-TENANCY.md) before touching these layers.

## 3. Completed work and evidence

- Local registration/login/current-user/logout, per-user workspace records, membership/role checks, workspace state validation, and server-derived local trial status exist.
- Onboarding checklist/lessons, Business Profile inputs, Adviser prompt cards, trial status UI, and current palette are implemented in the app.
- Connection-test adapters are registered for Gemini, Groq, and OpenRouter. Tests use mocks; no live provider call was verified.
- A draft Supabase schema/RLS migration covers core product objects; no PostgreSQL/RLS run occurred.
- Latest known local checks: TypeScript `npm run lint` passed; `npm run build` passed with existing non-fatal Zod-comment and >500 KB bundle warnings; 16 provider/trial tests passed; 28 local JSON tenant tests passed; isolated local Express smoke tests passed. These are not staging or production evidence. Details and scope are in [project status](../../PROJECT-STATUS.md).
- Signup/review and public-sample learning screens were inspected at 390px, 768px, and 1440px with no overflow in those screens; a learning dialog's keyboard focus and Escape behavior were checked. Full authenticated/screen-reader acceptance is still outstanding.

## 4. Incomplete work and blockers

1. Supabase Auth and durable PostgreSQL repository are not implemented; migration is unexecuted.
2. No verified hosted API origin, staging URL, or staging account exists.
3. Production APIs are deliberately blocked. Removing that block before hosted auth/storage/CSRF/RLS/security work would be unsafe.
4. Account AI generation is disabled. Trial counting is not wired to real generation; no durable usage ledger or automatic fallback exists.
5. Social OAuth, publishing, verified analytics, customer asset storage, email verification/recovery, and background workers are absent.
6. Demo/sample content and legacy canned AI fallbacks remain in the codebase; distinguish them from account functionality.
7. Credentials were previously pasted into chat. Revoke and rotate those values through their providers; do not repeat or configure them from this document.
8. The official Canva identity could not be verified. The attached palette image gives `#111111`, `#FFFFFF`, `#FF4F00`, `#FFD400`, but is not proof of the official parent-brand palette. No official logo or exact font names were found.
9. Older blueprint pricing is illustrative draft content and is not approved or offered.

## 5. Git state and repository

- Official repository: `https://github.com/mi-murad/SwapnoAI`
- Base branch at audit start: `main`
- Base commit: `bdc4bd990ddb3f994bd2d2423924469467d7bab7`
- At audit start the working tree contained prior Copilot implementation changes, none staged; local JSON and environment files were ignored.
- The handoff branch push succeeded. Verify the current SHA with `git rev-parse HEAD` and compare it with `git ls-remote origin refs/heads/claude/handoff-2026-11-09`. A push to `main` may trigger production and must not be used without verifying hosting branch settings.

## 6. Environment setup

Use Node.js 24.x. `npm ci`; `npm run dev`; open `http://localhost:5000`. `npm run lint`, `npm run test:providers`, and `npm run build` are the primary checks. Read [development setup](../DEVELOPMENT-SETUP.md) and [environment variables](../ENVIRONMENT-VARIABLES.md). Use isolated temporary storage for tenant tests; do not overwrite local JSON.

## 7. Deployment

- Vercel: static frontend configuration only.
- Render: Express service configuration with `PUBLIC_DEMO_MODE=true`; API routes are blocked under production.
- Staging frontend URL: none verified.
- Staging backend URL / health: none deployed or verified.
- Do not claim production/customer readiness from local builds. Do not enter real customer data.
- Host CLI tools and deployment credentials were not available during this handoff. The branch push is verified, but no preview was deployed; deployment readiness is not implied by a GitHub branch.

## 8. Database and authentication

Local APIs persist to ignored JSON. Custom JWT cookie session lasts seven days. Workspace routes enforce membership and roles locally. There is no email lifecycle. Supabase client may initialize, but it does not persist product data. Never apply the draft migration to production; first review, apply only to an approved staging project, and write two-user RLS tests.

## 9. AI provider status

Gemini, Groq, and OpenRouter adapters perform explicit small connection tests only when keys and flags are configured. All provider flags default false. The tests inject fake clients. `AI_FREE_FALLBACK_ENABLED` is future-only; no router reads it. OpenRouter checks `:free` suffix but that is not a guarantee of upstream cost, availability, or data retention. No provider is connected/live-verified, and no credentials belong in chat or Git.

## 10. Confirmed brand and UX decisions

- Treat attached palette as user-provided reference: Pure Black `#111111`, Crisp White `#FFFFFF`, Safety Orange `#FF4F00`, Cyber Yellow `#FFD400`.
- Do not call it the official SWAPNO TECH identity until verified against accessible brand source.
- Do not invent logo artwork or claim current typefaces are official.
- Plain, customer-friendly copy; one Adviser; onboarding is skippable/replayable; no forced OAuth; truthful trial/account states; no fake AI outputs as live results.
- Seven-day/no-card/25-action policy is local configurable policy only; no automatic charge, and usage remains disconnected from live operations.

## 11. Critical safety

- Keep all `.env`, provider credentials, local `db.json`, `data/`, uploads, and user records out of Git.
- Do not request or display credentials in chat.
- No production migration, paid service, or external publishing without explicit owner approval.
- Never enable production APIs backed by local JSON.
- Never claim an integration works without a real authenticated request and evidence.

## 12. Recommended next development phase

After private credential rotation, provision a separate staging Supabase project. Review the migration, implement Supabase Auth/repository, and verify two-user RLS plus server-side membership checks before configuring a staging API. Keep UI/AI/publishing scope unchanged until this secure persistence foundation is proven.

## 13. Claude's first session

Start with this exact instruction:

> Read CLAUDE.md and docs/handoff/CLAUDE-CODE-HANDOFF.md completely. Then inspect the current repository and compare the actual implementation against the project status and product requirements. Do not rebuild or redesign the project immediately. First produce a verified implementation audit, identify the highest-priority gaps, and propose the next development sprint. Preserve all completed work and existing decisions. Ask before destructive changes, paid services, production migrations, or external publishing.

Priority order:

1. Verify branch, commit, and worktree before editing.
2. Compare the docs against actual source; preserve local data and all existing changes.
3. Resolve private credential rotation and owner-provisioned staging prerequisites.
4. Implement/test Supabase Auth + repository + RLS in staging.
5. Only then enable and browser-test account workflows on a separate staging deployment.
