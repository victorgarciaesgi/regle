import { alpha } from '../alpha';

describe('alpha validator', () => {
  it('should validate undefined', () => {
    expect(alpha.validator(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(alpha.validator(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(alpha.validator('')).toBe(true);
  });

  it('should not validate numbers', () => {
    expect(alpha.validator('1234')).toBe(false);
  });

  it('should not validate space', () => {
    expect(alpha.validator(' ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alpha.validator('abcdefghijklmnopqrstuvwxyz')).toBe(true);
  });

  it('should validate english letters uppercase', () => {
    expect(alpha.validator('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true);
  });

  it('should not validate alphanum', () => {
    expect(alpha.validator('abc123')).toBe(false);
  });

  it('should not validate padded letters', () => {
    expect(alpha.validator(' abc ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(alpha.validator('🎉')).toBe(false);
  });
});
