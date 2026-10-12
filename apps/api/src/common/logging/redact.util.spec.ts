import { redactSensitive } from './redact.util';

describe('redactSensitive', () => {
  it('redacts secret-bearing keys at any depth', () => {
    const out = redactSensitive({
      username: 'amina',
      sessionSecret: 'shh',
      nested: { darajaPasskey: 'shh', amount: 100 },
      password: 'shh',
    });
    expect(out).toEqual({
      username: 'amina',
      sessionSecret: '[redacted]',
      nested: { darajaPasskey: '[redacted]', amount: 100 },
      password: '[redacted]',
    });
  });

  it('masks Kenyan phone numbers embedded in strings', () => {
    const out = redactSensitive({ phone: '+254712345678' });
    expect(out.phone).not.toContain('12345');
    expect(out.phone).toContain('+2547');
  });

  it('passes through nullish and scalar inputs', () => {
    expect(redactSensitive(null)).toBeNull();
    expect(redactSensitive('ok')).toBe('ok');
  });
});
