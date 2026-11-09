# Deployment Guide and Current Limits

## Verified configuration

### Vercel frontend

`vercel.json` runs `npm run build:client` and publishes `dist`. It does not host Express. Project root must be the repository root. `VITE_API_BASE_URL` is a public build-time API origin if/when a real API is deployed; it is currently unset and should not be pointed at an unverified service.

### Render backend

`render.yaml` builds `npm ci --no-audit --no-fund && npm run build`, starts with `npm start`, and checks `/healthz`. It sets `PUBLIC_DEMO_MODE=true` and `NODE_ENV=production`. The Express guard also blocks APIs for all production mode, so this is not an account backend. Render's free filesystem is ephemeral and not suitable for JSON customer data.

## Public deployment status

The static sample frontend is live at [https://swapno-ai.vercel.app/](https://swapno-ai.vercel.app/). After publishing commit `d9215fa70a8fb4eb93dcb83991b65633b5261388` to `main`, the URL returned HTTP 200 and served the same JavaScript/CSS asset hashes as the local build. The sample workspace opened in a browser. This confirms only the static demo: no hosted backend, staging API, account persistence, or live AI integration is connected. Do not enter real customer information. The exact scope and remaining blockers are in the [release report](release/STAGING-RELEASE-REPORT.md).

## Safe future staging sequence

1. Use a separate staging Supabase project and review the draft migration; do not apply it to production.
2. Implement Supabase Auth/repository and verify two-user RLS tests before staging customer accounts.
3. Deploy Express to a persistent/managed staging service, with generated `JWT_SECRET`, exact `FRONTEND_ORIGINS`, documented proxy hop count, and API rate limiting suitable for the chosen host.
4. Set `VITE_API_BASE_URL` in the Vercel preview environment to that staging API origin, then redeploy a Preview build.
5. Confirm HTTPS, cookie behavior (including same-site/CSRF implications), CORS preflight, `/healthz`, `/api/v1/auth/me`, protected workspace routes and cross-tenant denials.
6. Run account smoke tests with test-only data and review logs for secrets or personal data.

Do not enable the existing production API guard until the auth, persistence, quota, and cross-origin design is reviewed. Do not deploy paid infrastructure or create production services without explicit approval. See [environment reference](ENVIRONMENT-VARIABLES.md) and [backend deployment plan](BACKEND-DEPLOYMENT-PLAN.md).
