# Product Roadmap — Evidence-Based Next Steps

This roadmap is ordered by safety and dependency, not a promise of release dates or commercial terms.

## P0 — Secure, durable account foundation

- Rotate secrets exposed in chat.
- Create isolated staging infrastructure only after owner setup.
- Implement Supabase Auth and a persistent Postgres repository.
- Review the migration; test RLS and API workspace roles with two users.
- Define session/CSRF/CORS strategy and verify hosted HTTPS cookies.
- Preserve ignored local JSON data; no implicit import or destructive migration.

## P1 — Reliable core customer journey

- Run new-account, optional-step skip, completed onboarding, return visit, and expired-trial acceptance scenarios.
- Persist approved Business Brain changes using the staging repository and verify tenant isolation.
- Make demo/sample behavior unmistakable; remove or gate any sample feature that could be mistaken for an account result.
- Complete accessible, responsive dashboard navigation and save/error/empty states.

## P2 — AI and trial safety

- Select approved model/provider terms and costs; retain provider calls server-side.
- Implement one real generation route behind explicit owner/provider configuration.
- Atomically enforce trial limits and record usage before enabling restricted operations.
- Surface timeout, quota, provider failure, and trial-expiration states; never silently use paid fallback.
- Test only with user-approved, non-sensitive data.

## P3 — External integrations

- Evaluate object storage, background jobs, social OAuth/publishing, analytics, email lifecycle, and audit/retention controls independently.
- Require platform permissions and owner approval; report “published” only with a verified remote post ID.
- Do not choose paid services or activate real account writes without explicit approval.

## Product and business assumptions

No pricing, paid plan, billing behavior, or launch date is approved in source. Numeric plan prices in `docs/foundation/03-PRODUCT-BLUEPRINT.md` are draft concept material, not an offer. The no-card, 7-day, 25-action trial is a configurable local policy, not an active production entitlement system.
