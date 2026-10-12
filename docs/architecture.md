# ReVendo architecture (Phase 1 baseline)

## System shape

TypeScript monorepo, modular-monolith backend.

- `apps/web` — Next.js App Router (React + TypeScript). SSR storefront shell only in Phase 1.
  Owns no auth state: forwards to the API over server-side HTTP, keeps cookies HTTP-only.
- `apps/api` — NestJS REST API (`/api/v1`). Owns auth/sessions (later), validation,
  CORS, rate limits, and every business transaction.
- `packages/contracts` — shared Zod schemas (KES money, Kenyan E.164 phones, pagination,
  error + health envelopes). Imported by web; mirrored by API DTOs.
- `prisma/schema.prisma` — single MySQL schema source of truth; versioned migrations.
- Docker Compose — local MySQL 8.4 + Redis 7 (+ optional MailHog profile).

## Dependency direction

`web -> contracts <- api`; `api -> prisma -> MySQL`; `web -/-> MySQL` (forbidden).
Background jobs (BullMQ/Redis, Phase 5+) live behind the API worker boundary and never
run inside request-scoped DB transactions alongside provider network calls.

## Future module boundaries (documented, not implemented)

Auth | Users+Profiles | Seller onboarding | Catalog+Categories | Uploads (signed Cloudinary)
| Cart | Checkout+Orders | Payments adapters | Commission+Ledger | Earnings+Payouts
| Refunds+Disputes | Reviews+Wishlist | Admin+Moderation | Notifications+Jobs | Audit+Observability.

Each future module gets: NestJS module + service (transactional core) + controller (thin)
+ DTOs validated by both class-validator and contracts + Jest tests + migration (if storage).
Cross-module calls go through service interfaces, never direct table access from controllers.

## Key Phase 1 decisions

- Money = integer minor units, JSON as decimal strings, MySQL BIGINT. Documented in
  `packages/contracts` and `docs/payments-and-settlement.md`.
- Sessions table exists for the Phase 2 auth design; no session issuance yet.
- Idempotency + audit tables exist now so checkout/payments/payouts can rely on them later.
- No microservices: a modular monolith keeps financial transactions ACID until scale demands otherwise.
