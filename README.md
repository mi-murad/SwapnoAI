# SWAPNO AI

SWAPNO AI is an early-stage marketing-partner product for small businesses. The repository currently contains a fictional sample experience and a separately implemented local account API. It is **not a production SaaS or a live AI/publishing product**.

## Technology

- React 19, TypeScript, Vite 6, Tailwind CSS 4
- Express 4 API and Node.js 24 runtime
- Local JSON persistence for development accounts; Supabase PostgreSQL/Auth are planned, not active
- Server-side Gemini/Groq/OpenRouter connection-test adapters; no production generation router

## Run locally

Prerequisite: Node.js 24.x and npm. Windows PowerShell:

```powershell
npm ci
npm run dev
```

Open `http://localhost:5000`. The Express development process serves the app and Vite middleware. Local development APIs are enabled by default; local data is written to ignored JSON files. Use test data only.

## Check and build

```powershell
npm run lint
npm run test:providers
npm run build
npm start
```

The production server listens on `PORT` (default 5000), serves `dist/`, and exposes `GET /healthz`. `npm run lint` is TypeScript checking (`tsc --noEmit`). See [DEVELOPMENT-SETUP.md](docs/DEVELOPMENT-SETUP.md) for all test commands and limitations.

## Deployment reality

- Public sample preview: [https://swapno-ai.vercel.app/](https://swapno-ai.vercel.app/). It serves the static frontend only.
- Render configuration builds Express but sets `PUBLIC_DEMO_MODE=true`; in addition, all `NODE_ENV=production` API requests are blocked by the current server guard.
- There is no hosted backend or staging API. The frontend is a sample/demo experience; account authentication, durable database persistence, AI generation, social connections, and publishing are not available in the public deployment. Do not connect customer accounts or enter customer data.

See [DEPLOYMENT-GUIDE.md](docs/DEPLOYMENT-GUIDE.md), [PROJECT-STATUS.md](PROJECT-STATUS.md), and the [staging release report](docs/release/STAGING-RELEASE-REPORT.md).

## Documentation

- [Project overview](docs/PROJECT-OVERVIEW.md) and [architecture](docs/ARCHITECTURE.md)
- [Environment variable reference](docs/ENVIRONMENT-VARIABLES.md)
- [Database and tenant status](docs/DATABASE-AND-TENANCY.md)
- [Security and privacy](docs/SECURITY-AND-PRIVACY.md)
- [Product roadmap](docs/PRODUCT-ROADMAP.md)
- [Claude Code instructions](CLAUDE.md) and [handoff](docs/handoff/CLAUDE-CODE-HANDOFF.md)

The blueprint under `docs/foundation/` includes concept and business-model proposals that are not active features. Its illustrative pricing is not approved or offered.
