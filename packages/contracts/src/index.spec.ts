import {
  ApiErrorSchema,
  CurrencySchema,
  HealthResponseSchema,
  MinorUnitsSchema,
  PaginationInputSchema,
  PositiveMinorUnitsSchema,
  bigIntToMinorUnits,
  formatKes,
  normalizeKenyaPhone,
} from './index';

describe('CurrencySchema', () => {
  it('accepts KES and rejects anything else', () => {
    expect(CurrencySchema.safeParse('KES').success).toBe(true);
    expect(CurrencySchema.safeParse('USD').success).toBe(false);
    expect(CurrencySchema.safeParse('kes').success).toBe(false);
    expect(CurrencySchema.safeParse('').success).toBe(false);
  });
});

describe('MinorUnitsSchema', () => {
  it.each(['0', '1', '125000', '9000000000000000'])('accepts %s', (v) => {
    expect(MinorUnitsSchema.safeParse(v).success).toBe(true);
  });

  it.each(['-1', '12.5', '1,000', '', ' 100', '100 ', '00', '01', 'abc', '1e3'])(
    'rejects %s',
    (v) => {
      expect(MinorUnitsSchema.safeParse(v).success).toBe(false);
    },
  );

  it('rejects values above the supported maximum', () => {
    expect(MinorUnitsSchema.safeParse('9000000000000001').success).toBe(false);
  });

  it('rejects non-string JSON numbers (precision trap)', () => {
    expect(MinorUnitsSchema.safeParse(125000).success).toBe(false);
  });
});

describe('PositiveMinorUnitsSchema', () => {
  it('requires strictly positive amounts', () => {
    expect(PositiveMinorUnitsSchema.safeParse('1').success).toBe(true);
    expect(PositiveMinorUnitsSchema.safeParse('0').success).toBe(false);
  });
});

describe('minor-unit helpers', () => {
  it('round-trips BigInt without precision loss', () => {
    expect(bigIntToMinorUnits(125000n)).toBe('125000');
    expect(() => bigIntToMinorUnits(-1n)).toThrow(RangeError);
  });

  it('formats KES for display only', () => {
    expect(formatKes('125000')).toBe('KSh 1,250.00');
    expect(formatKes(0n)).toBe('KSh 0.00');
  });
});

describe('normalizeKenyaPhone', () => {
  it.each([
    ['+254712345678', '+254712345678'],
    ['0712345678', '+254712345678'],
    ['712345678', '+254712345678'],
    ['254712345678', '+254712345678'],
    ['+254 712 345 678', '+254712345678'],
    ['0712-345-678', '+254712345678'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeKenyaPhone(input)).toBe(expected);
  });

  it.each(['', '123', '+255712345678', '+254012345678', '071234567', '+2547123456789'])(
    'rejects %s',
    (input) => {
      expect(normalizeKenyaPhone(input)).toBeNull();
    },
  );
});

describe('PaginationInputSchema', () => {
  it('applies defaults and coerces strings', () => {
    expect(PaginationInputSchema.parse({})).toEqual({ page: 1, pageSize: 20 });
    expect(PaginationInputSchema.parse({ page: '2', pageSize: '10' })).toEqual({
      page: 2,
      pageSize: 10,
    });
  });

  it('rejects out-of-range values', () => {
    expect(PaginationInputSchema.safeParse({ page: 0 }).success).toBe(false);
    expect(PaginationInputSchema.safeParse({ pageSize: 101 }).success).toBe(false);
  });
});

describe('ApiErrorSchema + HealthResponseSchema', () => {
  it('accepts a standard error envelope', () => {
    expect(ApiErrorSchema.safeParse({ statusCode: 400, message: 'Bad' }).success).toBe(true);
  });

  it('accepts a valid health payload', () => {
    expect(
      HealthResponseSchema.safeParse({
        status: 'ok',
        service: 'revendo-api',
        version: '0.1.0',
        timestamp: new Date().toISOString(),
      }).success,
    ).toBe(true);
  });
});
