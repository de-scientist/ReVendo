# Security baseline (Phase 1)

Implemented in scaffold; hardened in later phases with auth, RBAC, and provider work.

- **Secrets:** `.env` git-ignored; `.env.example` holds placeholders only. Env loader
  (`apps/api/src/config/env.ts`) fails fast on invalid config and never echoes secret
  values. Production secrets come from the hosting secret manager.
- **API hardening:** `helmet` headers, explicit CORS allow-list (`CORS_ORIGINS` else
  `WEB_ORIGIN`), global `ValidationPipe` (`whitelist + forbidNonWhitelisted`),
  `ThrottlerModule` (120 req/min default), centralized `AllExceptionsFilter` with
  correlation IDs and 5xx message hiding.
- **Logging:** structured Nest logger; `redactSensitive()` strips secret-bearing keys
  and masks `+254...` numbers before logs leave the process.
- **Injection:** all storage access via Prisma (parameterized). No raw SQL string
  interpolation in Phase 1.
- **Auth boundary (documented):** NestJS will own sessions; cookies HTTP-only,
  `Secure` in production, `SameSite=Lax`; mutations need CSRF protection (Phase 2).
  No tokens in `localStorage`. Web calls API server-side; browser never touches MySQL.
- **Uploads (reserved):** Cloudinary secrets stay server-side; Phase 3 uses signed
  uploads with MIME/size validation.
- **Webhooks (reserved):** provider callbacks must use the provider's real verification
  + reconciliation (see `docs/payments-and-settlement.md`). No generic-signature invention.
- **Backups/recovery:** managed MySQL PITR + daily encrypted backups are a deployment
  requirement (Phase 7 checklist); local Compose volumes are not a backup strategy.
- **Dependencies:** `npm audit` level moderate via `.npmrc`; CI installs from lockfile.
- **Compliance:** Kenyan Data Protection Act / ODPC obligations, consumer-protection and
  KRA tax treatment need legal review — documentation here is not a compliance claim.

No vulnerability scan is claimed as passed in Phase 1 beyond `npm audit`-level hygiene
during installs; formal checks land in Phase 7.
