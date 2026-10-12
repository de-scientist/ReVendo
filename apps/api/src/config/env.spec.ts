import { loadEnv, redactedEnv, resolveCorsOrigins } from './env';

const BASE = {
  DATABASE_URL: 'mysql://revendo:revendo_local_only@localhost:3306/revendo',
  SESSION_SECRET: 'a'.repeat(32),
};

describe('loadEnv', () => {
  it('applies safe defaults with payments disabled', () => {
    const env = loadEnv({ ...BASE } as NodeJS.ProcessEnv);
    expect(env.PAYMENTS_ENABLED).toBe(false);
    expect(env.PAYMENTS_LIVE_ENABLED).toBe(false);
    expect(env.PAYOUTS_ENABLED).toBe(false);
    expect(env.DARAJA_ENVIRONMENT).toBe('sandbox');
  });

  it('rejects a short session secret without leaking its value', () => {
    let message = '';
    try {
      loadEnv({ ...BASE, SESSION_SECRET: 'short' } as NodeJS.ProcessEnv);
    } catch (err) {
      message = (err as Error).message;
    }
    expect(message).toMatch(/SESSION_SECRET/);
    expect(message).not.toContain('short');
  });

  it('rejects production live payments without credentials', () => {
    expect(() =>
      loadEnv({ ...BASE, NODE_ENV: 'production', PAYMENTS_ENABLED: 'true', PAYMENTS_LIVE_ENABLED: 'true' } as NodeJS.ProcessEnv),
    ).toThrow(/DARAJA/);
  });

  it('never includes secret values in validation errors', () => {
    const secret = `super-secret-${Date.now()}`;
    try {
      loadEnv({ DATABASE_URL: 'mysql://x', SESSION_SECRET: 'short' } as NodeJS.ProcessEnv);
    } catch (err) {
      expect((err as Error).message).not.toContain(secret);
      expect((err as Error).message).not.toContain('mysql://x');
    }
  });
});

describe('resolveCorsOrigins', () => {
  it('falls back to WEB_ORIGIN when no list is configured', () => {
    expect(resolveCorsOrigins({ WEB_ORIGIN: 'http://localhost:3000' })).toEqual(['http://localhost:3000']);
  });

  it('parses an explicit allow-list', () => {
    expect(
      resolveCorsOrigins({ WEB_ORIGIN: 'http://localhost:3000', CORS_ORIGINS: 'https://a.example, https://b.example' }),
    ).toEqual(['https://a.example', 'https://b.example']);
  });
});

describe('redactedEnv', () => {
  it('redacts secret keys', () => {
    const out = redactedEnv({ SESSION_SECRET: 'abc', NODE_ENV: 'test' });
    expect(out.SESSION_SECRET).toBe('[redacted]');
    expect(out.NODE_ENV).toBe('test');
  });
});
