# Database and Tenant Isolation

**Decision:** Supabase PostgreSQL with Supabase Auth is the recommended production foundation.<br>
**Status:** Schema migration drafted; not applied; production persistence and Auth are not connected.<br>

## Current state

- `src/server/db/database.ts` reads and writes `data/swapno_multi_tenant_db.json`. Its Supabase client initialization does not back application reads or writes.
- `src/server/auth/authService.ts` uses bcrypt, an application JWT, and that local JSON store. There is no email verification or password-recovery flow.
- Workspace API membership checks are server-side, but they are not PostgreSQL RLS.
- `data/` and `db.json` are ignored local files. They have not been migrated or deleted by this work.
- The prior tenant-isolation suite verifies local JSON behavior only. It is not evidence of database-level isolation.

## Proposed production model

Use Supabase Auth as the identity authority (verified email, password recovery, access/refresh lifecycle), and Supabase PostgreSQL for product data. Use the user's Supabase access token on backend database operations so PostgREST/PostgreSQL can evaluate `auth.uid()` and the tenant policies. Never use a service-role key for normal user requests: Supabase documents that `service_role` bypasses RLS.

The additive migration at `supabase/migrations/20261109190000_saas_tenancy_foundation.sql` defines:

- Auth-linked user profiles, workspaces, and roles/memberships.
- Business profiles and Business Brain nodes.
- Research reports, strategies, content calendars, and content items.
- Asset metadata, AI usage events, and audit logs.
- Workspace membership/role helpers, RLS on all product tables, restricted grants, and an auth-user profile trigger. Members can read workspace content; only owner/admin/editor roles can create or update it, and owner/admin can delete it. Workspace plans and ownership cannot be changed through the authenticated table grant.
- AI usage and audit records are readable by owner/admin, but authenticated clients cannot insert them; trusted server-side code must write these records with verified attribution.
- `updated_at` triggers keep mutable records current. Authenticated clients cannot create or change rows to `published`; a trusted publishing service must verify the remote post ID before applying that transition.
- Workspace trial dates, action limit, actions used, and included actions are server-owned columns. The private platform trial policy defaults to seven days and 25 actions; authenticated clients cannot update that policy or write trial columns. `public.create_workspace(text)` creates the workspace, its initial owner membership, and blank business profile from the private policy.

The `published` content constraint requires both a remote post ID and publication timestamp. Authenticated RLS policies also disallow direct client publication transitions. No destructive operation or local JSON import is included.

### Required safeguards before applying

1. Create a Supabase project and verify its PostgreSQL version supports the SQL functions/features in the migration.
2. Review and apply the migration to a new/staging project first; this file has not been run against a database.
3. Add integration tests using two authenticated Supabase users and workspaces, asserting cross-tenant select/insert/update/delete are rejected by RLS.
4. Configure Auth email confirmation, redirect URLs, SMTP/delivery settings, password recovery, and account deletion policy.
5. Implement the Supabase repository and replace the JSON repository for production. Do not copy local `data/` records automatically; preserve them and make any import an explicit, backed-up, owner-approved operation.
6. Keep the Supabase service-role/secret key exclusively in a server-side migration/administration context. User API requests must use scoped Supabase access tokens and RLS.
7. Wire trial authorization and successful-action accounting to actual generation requests, including concurrency-safe quota enforcement and integration tests. The local JSON trial helper is not a production quota system.

The application still uses local JSON today. The presence of this migration is not a claim that the migration has run, that RLS is active, or that product data is in Supabase.

## Table and policy boundaries

| Tables | Policy boundary |
|---|---|
| `user_profiles` | User reads/writes only their own profile (`auth.uid()`). |
| `workspaces` | Members can read; owner/admin can update; workspace owner creates/deletes. |
| `workspace_memberships` | Members can read membership records; owner/admin can manage allowed roles; initial owner can only be attached to a workspace they own. |
| Business, Brain, research, strategy, calendar, content, assets | Members can read; owner/admin/editor can insert and update; owner/admin can delete. Server routes must also verify active membership and role. |
| `ai_usage_events`, `audit_logs` | Owner/admin can read. Authenticated clients cannot write accounting/audit rows; trusted backend code must derive workspace/user attribution and write these records. |

RLS is defense in depth, not a substitute for request authorization. Use strict Zod validation, workspace membership checks, and server-generated user/workspace attribution. Never expose a service-role key to the browser.
