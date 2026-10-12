# Local development (Windows PowerShell)

## Prerequisites

- Node.js 22 LTS + npm 10 (`node --version`, `npm --version`).
- Git. Docker Desktop for MySQL/Redis (optional but recommended).
- No payment, Cloudinary, or SMTP credentials needed for Phase 1.

## Initial setup

```powershell
Copy-Item .env.example .env
# Edit .env: set SESSION_SECRET to a long random value (32+ chars).
npm install
```

## Infrastructure

```powershell
docker compose up -d mysql redis        # core services
docker compose ps                       # inspect
docker compose --profile mail up -d     # optional MailHog (UI http://localhost:8025)
docker compose down                     # stop (data kept in named volumes)
```

Reset (deletes local data — development only):

```powershell
docker compose down -v  # WARNING: deletes MySQL + Redis volumes
```

Without Docker, the web app and API typecheck/tests still run; only
migration-against-MySQL and live health checks need the database.

## Database

```powershell
npm run db:generate                                   # Prisma Client
npx prisma validate --schema prisma/schema.prisma     # schema check
npm run db:migrate                                    # reviewed migration vs local MySQL
```

Never run `prisma db push` as the normal workflow and never migrate an unknown
or production database from a dev machine.

## Run

```powershell
npm run dev:api   # http://localhost:3001/api/v1/health
npm run dev:web   # http://localhost:3000
```

## Quality gates

```powershell
npm run typecheck
npm run lint
npm run test
npm run build
```

## Add a package / backend module

- New shared code: `packages/<name>/` with its own `package.json`, `tsconfig.json`,
  and workspace registration via `apps/*, packages/*` (already globbed).
- New API module: `apps/api/src/<domain>/` + `<domain>.module.ts`, registered in
  `AppModule` imports; add DTOs, service tests (`*.spec.ts`), and a Prisma migration
  when storage changes. Keep controllers thin; keep money in minor units.

## Known limitations (Phase 1)

- Docker may be unavailable (as in the build environment) — migration execution then
  stays `Not verified` until run against local MySQL.
- Playwright e2e is deferred: no browser suite is claimed until browsers + both apps
  can run coherently in CI.
