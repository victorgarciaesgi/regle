import { isString } from '../isString';

describe('isString helper', () => {
  it('should return false for nullish values', () => {
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isString(1)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString(['a'])).toBe(false);
  });

  it('should return true for string values', () => {
    expect(isString('')).toBe(true);
    expect(isString('hello')).toBe(true);
  });
});
