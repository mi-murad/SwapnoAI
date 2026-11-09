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
