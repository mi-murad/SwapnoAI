# Claude Code Instructions — SWAPNO AI

## Read before changing anything

Read these files completely before implementation:

1. [Project status](PROJECT-STATUS.md)
2. [Project overview](docs/PROJECT-OVERVIEW.md) and [architecture](docs/ARCHITECTURE.md)
3. [Product blueprint and customer journey](docs/foundation/03-PRODUCT-BLUEPRINT.md) and [docs/foundation/04-CUSTOMER-JOURNEY.md](docs/foundation/04-CUSTOMER-JOURNEY.md)
4. [Security and privacy](docs/SECURITY-AND-PRIVACY.md)
5. [Claude handoff](docs/handoff/CLAUDE-CODE-HANDOFF.md)

Then inspect the actual current branch, worktree, and relevant source. Treat documents as status/context, not proof; verify claims against code.

## Non-negotiable working rules

- Preserve existing code, decisions, user data, and Git history. Do not reset/rebase destructively, delete local databases, or overwrite data to make a test pass.
- Understand existing implementation and behavior before replacing components. Keep the React/Vite/TypeScript and Express/Node stack unless a concrete, documented requirement justifies a change.
- Continue the customer-friendly “one Marketing Adviser” UX. Current palette reference is the user-provided Safety Orange image: Pure Black `#111111`, Crisp White `#FFFFFF`, Safety Orange `#FF4F00`, Cyber Yellow `#FFD400`. Do not call it the official SWAPNO TECH palette; official Canva access/logo/font evidence is unavailable.
- Use secure, workspace-scoped authorization on every account operation. Never trust a client-supplied workspace ID without membership/role checks. Do not enable production APIs while they use local JSON.
- Never reveal, copy into source control, or log secrets. Do not ask for credentials in chat. Treat credentials previously shared in chat as compromised and require private rotation.
- Verify API integrations with an authenticated request before claiming they work. Test adapters and mocked tests are not live integrations. Do not enable paid use or automatic paid fallback.
- Never apply production database migrations without explicit owner approval. Do not publish, schedule, or modify customer social accounts without explicit approval.
- Do not create paid infrastructure, incur provider charges, or change production hosting without approval. Use staging/preview only when the target and effects are verified.
- Avoid unnecessary packages, duplicate frameworks, and broad rewrites. Make small, reviewable, type-safe changes and surface errors.
- Run the smallest relevant tests after each significant change. Do not claim responsive, accessibility, tenant-isolation, or production readiness based on unrelated tests.
- Update the relevant documentation and [project status](PROJECT-STATUS.md) at the end of each completed phase. Record tests actually run and known limitations.

## Development commands

Use Node.js 24.x. `npm ci`; `npm run dev` serves the local app/API at `http://localhost:5000`. `npm run lint` runs TypeScript checks, `npm run test:providers` runs provider-adapter tests, and `npm run build` builds Vite plus the Express bundle. Refer to [development setup](docs/DEVELOPMENT-SETUP.md).

## Current architecture warning

The account backend still uses local JSON/custom JWT auth. Supabase is initialized optionally but is not the active data repository. The Supabase migration is unexecuted. Render is demo-only; Vercel serves only static frontend assets. Do not present these as a live multi-tenant SaaS.
