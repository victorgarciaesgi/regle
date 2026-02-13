import { toNumber } from '../toNumber';

describe('toNumber helper', () => {
  it('should keep number values unchanged', () => {
    expect(toNumber(3)).toBe(3);
    expect(toNumber(-12.4)).toBe(-12.4);
  });

  it('should convert non-padded numeric strings', () => {
    expect(toNumber('42')).toBe(42);
    expect(toNumber('3.14')).toBe(3.14);
  });

  it('should return NaN for padded, nullish or invalid values', () => {
    expect(toNumber(' 42')).toBeNaN();
    expect(toNumber('42 ')).toBeNaN();
    expect(toNumber(undefined)).toBeNaN();
    expect(toNumber('abc' as any)).toBeNaN();
  });
});
