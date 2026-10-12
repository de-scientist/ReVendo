# ReVendo

**Give Things a Second Life.**

Kenya-first marketplace scaffold for pre-loved and unused goods. Currency: KES. Initial locale: English. This repository is at Phase 1 scaffolding only.

## Workspace layout

- `apps/web` — Next.js App Router + TypeScript storefront shell.
- `apps/api` — NestJS API shell, versioned API prefix, health endpoint.
- `packages/contracts` — shared Zod contracts for KES, integer minor-unit strings, and Kenyan E.164 phone numbers.
- `prisma` — MySQL Prisma bootstrap schema.
- `docker-compose.yml` — local MySQL 8.4, Redis 7, optional MailHog profile.
- `.github/workflows/ci.yml` — starter CI validation workflow.
- `docs/PHASE-1.md` — setup and safety notes.

## Quick start

See [Phase 1 setup](docs/PHASE-1.md). Requires Node.js 22+, npm 10+, and Docker Desktop.

## Payment safety

Live payments are not implemented. `PAYMENTS_ENABLED=false` and `DARAJA_B2C_ENABLED=false` are explicit safe defaults. Do not enable production collection or disbursement until provider, legal, compliance, and operational approvals are complete.
