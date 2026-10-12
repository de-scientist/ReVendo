# Database (Phase 1 foundation)

## Schema scope

`prisma/schema.prisma` models: `User`, `SellerProfile`, `Category`, `Product`,
`ProductImage`, `Session`, `AuditLog`, `IdempotencyKey`, `SystemSetting`.

Deliberately deferred: addresses, carts, orders, payments, refunds, commission rules,
seller earnings, ledger entries, payout accounts/payouts, disputes, reviews, wishlists.
They are introduced incrementally with reviewed migrations (see `docs/architecture.md`).

## Conventions

- Engine InnoDB, charset `utf8mb4`, all timestamps `DateTime(3)` treated as UTC.
- IDs `cuid()` `VARCHAR(30)`; opaque and non-sequential.
- Money: `BIGINT` minor units + `currency CHAR(3) DEFAULT 'KES'`. App enforces KES-only
  in Phase 1 (`CurrencySchema`). No floats anywhere in the money path.
- Product archive via `status = ARCHIVED`; no hard delete after a sale. Images cascade
  with their product (cleanup scope); everything else uses `Restrict`/`SetNull` so
  financial and audit history cannot vanish via cascade.
- MySQL-compatible only: plain unique constraints + indexes. No PostgreSQL partial
  indexes. "One primary image per product" is enforced in service logic (Phase 3),
  not via a partial unique index.
- Full-text search boots with `@@fulltext([title, description])` (MySQL 8).

## Key indexes

- `User(email)`, `User(phone)`, `User(role, createdAt)`.
- `SellerProfile(userId UNIQUE)`, `(status, createdAt)`.
- `Category(slug UNIQUE)`, `(parentId, sortOrder)`.
- `Product(status, categoryId, createdAt)`, `(sellerId, status)`, `(status, priceMinor)`.
- `ProductImage(productId, position UNIQUE)`, `(productId)`.
- `Session(tokenHash UNIQUE)`, `(userId, expiresAt)`.
- `AuditLog(entityType, entityId)`, `(actorId, createdAt)`.
- `IdempotencyKey(expiresAt)`, `(ownerType, ownerId)`.

## Migration workflow

1. Edit `prisma/schema.prisma`.
2. Review SQL: `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script` (no DB needed) or `npm run db:migrate` against local MySQL.
3. Commit `prisma/migrations/<name>/migration.sql` — never edit a merged migration.
4. `npm run db:generate` + `npx prisma validate`.

Seed (`apps/api/prisma/seed.ts`) stays empty in Phase 1: no fake users, secrets, or transactions.
