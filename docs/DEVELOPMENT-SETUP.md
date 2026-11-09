# Development Setup

## Requirements

- Node.js `24.x` (see `.node-version` and `package.json`)
- npm
- Windows PowerShell is supported for the commands below

## Install and start

```powershell
npm ci
npm run dev
```

Open `http://localhost:5000`. The development process starts Express with Vite middleware. Stop it with Ctrl+C. Local API auth/data are not production-safe; use fake test identities and never customer data.

## Environment

Copy `.env.example` to `.env` only if you need to change local defaults. `.env` is ignored by Git. Most optional values can remain blank. Provider credentials are unnecessary for UI work and should only be supplied privately when an explicitly authorized real connection test is intended. See [environment variables](ENVIRONMENT-VARIABLES.md).

## Checks

```powershell
npm run lint
npm run test:providers
npm run build
```

`npm run lint` executes `tsc --noEmit`; there is no separate ESLint script. `npm run test:providers` runs `src/server/tests/aiProviderRegistry.test.ts` and `src/server/tests/openAICompatibleProvider.test.ts` with mocked provider clients.

Additional suites:

```powershell
& .\node_modules\.bin\tsx.cmd --test src\server\tests\trialService.test.ts
& .\node_modules\.bin\tsx.cmd src\server\tests\tenant_isolation.test.ts
```

Run the tenant script with an isolated temporary working directory so it cannot read or modify the developer's ignored local database. Its results cover local JSON only, not PostgreSQL/RLS. Do not run `npm start` against any personal data without verifying the expected working directory.

## Local API and ports

- Default Express/Vite port: `5000` (`PORT` overrides).
- Configure `FRONTEND_ORIGINS` as a comma-separated exact origin list when using a separate frontend origin.
- `VITE_API_BASE_URL` is compiled into the frontend; leave blank for same-origin local use.
- Production mode intentionally disables APIs and requires `JWT_SECRET` for server startup.

## Build output

`npm run build` runs `vite build` then bundles `server.ts` with esbuild to `dist/server.cjs`. `npm start` runs that bundle. Build may show existing Zod annotation and JS chunk-size warnings; see current status before interpreting them.
