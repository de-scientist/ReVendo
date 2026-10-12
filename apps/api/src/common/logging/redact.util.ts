const SENSITIVE_PATTERNS = [
  /secret/i,
  /passkey/i,
  /password/i,
  /token/i,
  /authorization/i,
  /cookie/i,
  /daraja/i,
  /cloudinary.*secret/i,
];

/** Deep-redact sensitive keys from log payloads. Returns a safe clone. */
export function redactSensitive<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (Array.isArray(input)) return input.map((v) => redactSensitive(v)) as unknown as T;
  if (typeof input === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (SENSITIVE_PATTERNS.some((re) => re.test(key))) {
        out[key] = '[redacted]';
      } else if (typeof value === 'object' && value !== null) {
        out[key] = redactSensitive(value);
      } else if (typeof value === 'string' && /\+254\d{9}/.test(value)) {
        // Mask Kenyan phone numbers in logs: +2547XXXXX678 -> +2547***678
        out[key] = value.replace(/(\+254\d)(\d{5})(\d{3})/g, '$1***$3');
      } else {
        out[key] = value;
      }
    }
    return out as T;
  }
  return input;
}
