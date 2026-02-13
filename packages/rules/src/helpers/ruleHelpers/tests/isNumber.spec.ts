import { isNumber } from '../isNumber';

describe('isNumber helper', () => {
  it('should return false for nullish values', () => {
    expect(isNumber(null)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
  });

  it('should return false for non-number and NaN values', () => {
    expect(isNumber('1')).toBe(false);
    expect(isNumber({})).toBe(false);
    expect(isNumber(Number.NaN)).toBe(false);
  });

  it('should return true for valid numbers', () => {
    expect(isNumber(0)).toBe(true);
    expect(isNumber(42)).toBe(true);
    expect(isNumber(-1.5)).toBe(true);
  });
});
