import { alphaNum } from '../alphaNum';

describe('alphaNum validator', () => {
  it('should validate undefined', () => {
    expect(alphaNum.validator(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(alphaNum.validator(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(alphaNum.validator('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(alphaNum.validator(1234567890)).toBe(true);
  });

  it('should not validate space', () => {
    expect(alphaNum.validator(' ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alphaNum.validator('abcxyzABCXYZ')).toBe(true);
  });

  it('should validate alphaNum', () => {
    expect(alphaNum.validator('abc123')).toBe(true);
  });

  it('should not validate padded letters', () => {
    expect(alphaNum.validator(' abc ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(alphaNum.validator('🎉')).toBe(false);
  });
});
