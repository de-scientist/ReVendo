import { z } from 'zod';

export const CurrencySchema = z.literal('KES');
export type Currency = z.infer<typeof CurrencySchema>;

// API monetary amounts are serialized as decimal integer strings to avoid JSON BigInt loss.
export const MinorUnitsSchema = z.string().regex(/^(0|[1-9]\d*)$/, 'Expected a non-negative integer in minor units');
export type MinorUnits = z.infer<typeof MinorUnitsSchema>;

export const KenyaPhoneSchema = z.string().regex(/^\+254[1-9]\d{8}$/, 'Use a Kenyan number in +254 format');
export type KenyaPhone = z.infer<typeof KenyaPhoneSchema>;
