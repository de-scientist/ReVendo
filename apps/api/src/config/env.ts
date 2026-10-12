import { z } from 'zod';

/**
 * Centralized environment validation (Phase 1).
 * - Fail fast on missing/invalid required config.
 * - Never echo secret values in errors or logs.
 * - Production guards: live payments/payouts stay disabled unless
 *   explicitly enabled WITH required credentials + approvals.
 */

const BoolString = z
  .union([z.boolean(), z.enum(['true', 'false'])])
  .transform((v) => v === true || v === 'true');

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
    CORS_ORIGINS: z.string().optional(),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
    SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
    LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

    // Payment feature flags — reserved for later phases, disabled by default.
    PAYMENTS_ENABLED: BoolString.default(false),
    PAYMENTS_LIVE_ENABLED: BoolString.default(false),
    PAYOUTS_ENABLED: BoolString.default(false),
    DARAJA_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
    DARAJA_CONSUMER_KEY: z.string().optional(),
    DARAJA_CONSUMER_SECRET: z.string().optional(),
    DARAJA_SHORTCODE: z.string().optional(),
    DARAJA_PASSKEY: z.string().optional(),
    DARAJA_CALLBACK_URL: z.string().optional(),
    DARAJA_B2C_ENABLED: BoolString.default(false),
  })
  .superRefine((env, ctx) => {
    if (env.DATABASE_URL.includes('://') === false) {
      ctx.addIssue({ code: 'custom', message: 'DATABASE_URL looks malformed', path: ['DATABASE_URL'] });
    }
    // Production must never start with live payments unless every gate is satisfied.
    if (env.NODE_ENV === 'production') {
      if (env.PAYMENTS_LIVE_ENABLED === true) {
        if (env.PAYMENTS_ENABLED !== true) {
          ctx.addIssue({
            code: 'custom',
            message: 'PAYMENTS_LIVE_ENABLED requires PAYMENTS_ENABLED=true',
            path: ['PAYMENTS_ENABLED'],
          });
        }
        if (env.DARAJA_ENVIRONMENT !== 'production') {
          ctx.addIssue({
            code: 'custom',
            message: 'Live payments require DARAJA_ENVIRONMENT=production',
            path: ['DARAJA_ENVIRONMENT'],
          });
        }
        for (const key of ['DARAJA_CONSUMER_KEY', 'DARAJA_CONSUMER_SECRET', 'DARAJA_SHORTCODE', 'DARAJA_PASSKEY'] as const) {
          if (!env[key]) {
            ctx.addIssue({ code: 'custom', message: `${key} is required for live payments`, path: [key] });
          }
        }
      }
      if (env.PAYOUTS_ENABLED === true && env.DARAJA_B2C_ENABLED !== true) {
        ctx.addIssue({
          code: 'custom',
          message: 'PAYOUTS_ENABLED requires DARAJA_B2C_ENABLED=true',
          path: ['DARAJA_B2C_ENABLED'],
        });
      }
      if (env.SESSION_SECRET === 'replace-with-at-least-32-random-characters') {
        ctx.addIssue({
          code: 'custom',
          message: 'SESSION_SECRET must be replaced in production',
          path: ['SESSION_SECRET'],
        });
      }
    }
  });

export type AppEnv = z.infer<typeof EnvSchema>;

const SECRET_KEYS = new Set([
  'SESSION_SECRET',
  'DATABASE_URL',
  'DARAJA_CONSUMER_SECRET',
  'DARAJA_PASSKEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_PASSWORD',
]);

/** Parse + validate process.env. Throws a redacted Error on failure (no secret values). */
export function loadEnv(raw: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    // Intentionally omit raw values — they may contain secrets.
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return parsed.data;
}

/** Allowed CORS origins: explicit CORS_ORIGINS list, else WEB_ORIGIN fallback. */
export function resolveCorsOrigins(env: Pick<AppEnv, 'WEB_ORIGIN' | 'CORS_ORIGINS'>): string[] {
  const list = (env.CORS_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? [...new Set(list)] : [env.WEB_ORIGIN];
}

/** Redact secret keys from an env-like record for safe logging. */
export function redactedEnv(env: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.keys(env).map((k) => [k, SECRET_KEYS.has(k) ? '[redacted]' : String(env[k] ?? '')]),
  );
}
