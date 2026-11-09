# SWAPNO AI

SWAPNO AI is a React/Vite frontend served by an Express application.

## Run locally

**Prerequisite:** Node.js 24 LTS (see `.node-version`) and npm.

```powershell
npm ci
npm run dev
```

The development server listens on port `5000`.

## Build and run

```powershell
npm run build
npm start
```

Set `PORT` to override the default server port. The production server serves the
compiled frontend from `dist/` and exposes `/healthz` for hosting health checks.

## Public preview deployment

### Vercel

The root `vercel.json` configures Vercel to build and publish only the Vite
frontend. Set the Vercel project root to the repository root and use the Vite
framework preset; the build command and output directory are pinned in
`vercel.json`. `package.json` pins the build to Node.js 24.x.

This is a static, sample-only preview. Vercel does not run the Express server,
and the production demo intentionally disables backend APIs, authentication,
and AI calls. No environment variables are required for this preview. Do not
use this deployment for customer data or as the production SaaS backend.

### Render

The root `render.yaml` configures a free Render web service. Create a Render
Blueprint from this GitHub repository and select the free plan; no paid services
are required for the preview.

The public deployment is intentionally a **sample-only demo**:

- It uses fictional, bundled example workspaces.
- Changes remain in browser memory and are lost on refresh.
- Backend APIs are disabled in production, including authentication, shared
  state, and AI routes.
- AI output, analytics, publishing, and social integrations are not live.
- Do not add customer data, API keys, or database files to the public repository.

Render's free web services use an ephemeral filesystem and can spin down while
idle. This configuration is suitable for previewing the interface only, not for
storing customer data or operating a production SaaS.

## Environment variables

`GEMINI_API_KEY` is read by the server for AI calls when those routes are enabled.
`JWT_SECRET` is required for authenticated production API deployments. Neither
value belongs in the browser or in Git. The public preview does not call either
service.
