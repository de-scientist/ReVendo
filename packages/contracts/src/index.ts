import { z } from 'zod';

/**
 * Shared ReVendo contracts (Phase 1).
 *
 * Single source of truth for cross-boundary validation:
 * - Next.js validates input / renders errors with these schemas.
 * - NestJS mirrors them in DTOs (class-validator) and re-validates server-side.
 *
 * Money convention (normative):
 * - All financial values are integer minor units (KES cents).
 *   KSh 1,250.00 === 125000 minor units.
 * - Never use floating-point arithmetic for commission, earnings, refunds or payouts.
 * - JSON boundary: serialize 64-bit integers as decimal strings (MinorUnitsSchema).
 * - MySQL: persist as BIGINT / Prisma BigInt. Rounding policy is defined
 *   before commission math lands (Phase 5); until then only representation is fixed.
 */

// ---------------------------------------------------------------- currency
export const CurrencySchema = z.literal('KES');
export type Currency = z.infer<typeof CurrencySchema>;
export const DEFAULT_CURRENCY: Currency = 'KES';

// ---------------------------------------------------------------- money
const MAX_MINOR_UNITS = 9_000_000_000_000_000n; // 9e15 — well within BIGINT + safe-string range

/** Decimal-string encoding of a non-negative integer in minor units. */
export const MinorUnitsSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)$/, 'Expected a non-negative integer in minor units')
  .refine((v) => {
    try {
      return BigInt(v) <= MAX_MINOR_UNITS;
    } catch {
      return false;
    }
  }, 'Amount exceeds maximum supported value');
export type MinorUnits = z.infer<typeof MinorUnitsSchema>;

/** Positive (strictly > 0) minor-unit amount, for prices / charges. */
export const PositiveMinorUnitsSchema = MinorUnitsSchema.refine((v) => BigInt(v) > 0n, {
  message: 'Amount must be greater than zero',
});
export type PositiveMinorUnits = z.infer<typeof PositiveMinorUnitsSchema>;

export function minorUnitsToBigInt(v: MinorUnits): bigint {
  return BigInt(v);
}

export function bigIntToMinorUnits(v: bigint): MinorUnits {
  if (v < 0n || v > MAX_MINOR_UNITS) throw new RangeError('Minor-unit value out of range');
  return v.toString() as MinorUnits;
}

/** Format minor units for display only (never for computation). */
export function formatKes(minor: string | bigint): string {
  const cents = typeof minor === 'bigint' ? minor : BigInt(minor);
  const negative = cents < 0n;
  const abs = negative ? -cents : cents;
  const shillings = abs / 100n;
  const remainder = (abs % 100n).toString().padStart(2, '0');
  const grouped = shillings.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${negative ? '-' : ''}KSh ${grouped}.${remainder}`;
}

// ---------------------------------------------------------------- phones (Kenya, E.164)
const KENYA_E164 = /^\+254[1-9]\d{8}$/;

export const KenyaPhoneSchema = z.string().regex(KENYA_E164, 'Use a Kenyan number in +254 format');
export type KenyaPhone = z.infer<typeof KenyaPhoneSchema>;

/**
 * Normalize Kenyan phone input to E.164 (+254...).
 * Accepts: +2547XXXXXXXX, 07XXXXXXXX, 7XXXXXXXX, 2547XXXXXXXX (with spaces/dashes).
 * Returns null when the input cannot be normalized to a valid Kenyan mobile number.
 */
export function normalizeKenyaPhone(input: string): KenyaPhone | null {
  const digits = input.replace(/[^\d+]/g, '');
  let normalized: string | null = null;
  if (KENYA_E164.test(digits)) {
    normalized = digits;
  } else if (/^0[17]\d{8}$/.test(digits)) {
    normalized = `+254${digits.slice(1)}`;
  } else if (/^[17]\d{8}$/.test(digits)) {
    normalized = `+254${digits}`;
  } else if (/^254[17]\d{8}$/.test(digits)) {
    normalized = `+${digits}`;
  }
  if (normalized && KENYA_E164.test(normalized)) return normalized as KenyaPhone;
  return null;
}

// ---------------------------------------------------------------- pagination
export const PaginationInputSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationInput = z.infer<typeof PaginationInputSchema>;

export function paginatedResponse<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  });
}

// ---------------------------------------------------------------- api envelope
export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  message: z.union([z.string(), z.array(z.string())]),
  error: z.string().optional(),
  correlationId: z.string().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('revendo-api'),
  version: z.string().min(1),
  timestamp: z.string().datetime({ offset: true }),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
