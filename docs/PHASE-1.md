# ReVendo — Phase 1 Scaffold

## Scope

This scaffold establishes a Next.js App Router web app, NestJS API, shared Zod contracts, Prisma/MySQL bootstrap, local MySQL/Redis infrastructure, environment template, and CI starter. It is not a complete marketplace implementation.

## Local setup (Windows PowerShell)

1. Extract this folder's contents into `C:\Users\gitau\Documents\ReVendo` (not into an extra nested folder if you want the repository root to be `ReVendo`).
2. Install Node.js 22+ with npm 10+, Docker Desktop, and Git.
3. Copy `.env.example` to `.env`; replace `SESSION_SECRET` with a long random value. Keep all real credentials out of Git.
4. Run `npm install`.
5. Run `docker compose up -d mysql redis`.
6. Run `npm run db:generate` and `npm run db:migrate` only after reviewing the initial schema.
7. Run `npm run dev:api` and `npm run dev:web` in separate terminals.

Web: http://localhost:3000
API health: http://localhost:3001/api/v1/health
MailHog (optional): `docker compose --profile mail up -d`; UI at http://localhost:8025

## Safety gates

- `PAYMENTS_ENABLED=false` and `DARAJA_B2C_ENABLED=false` are deliberate defaults.
- Do not add production Daraja credentials or enable live payment collection/disbursement in Phase 1.
- No payment provider integration, payout logic, seller balances, or financial ledger is implemented here.
- Do not treat browser-submitted prices, payment screenshots, or unverified callbacks as proof of payment.
- Local Compose passwords are for local development only; never reuse them in deployed environments.

## Architecture decisions

- Browser-facing auth/session ownership belongs to the NestJS API; planned cookies are HTTP-only, Secure in production, SameSite=Lax, and mutations require CSRF protection.
- The web application must call the API over HTTP; it must not connect directly to MySQL.
- Amounts are integer minor units and must serialize as strings at JSON boundaries.
- Do not hold a database transaction open across a payment-provider network call.
- Domain schema and migrations will be introduced in reviewed, incremental steps. MySQL does not support every PostgreSQL constraint pattern, so uniqueness/integrity rules must be implemented using MySQL-compatible schema and transaction patterns.

## Not yet implemented

Authentication/session persistence, RBAC, seller onboarding, catalog, moderation, uploads, cart/checkout, order snapshots, payment adapters/webhooks/reconciliation, commissions/ledger, payout workflows, disputes/refunds, notification jobs, audit trails, production observability, and end-to-end tests.
