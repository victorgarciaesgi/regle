import { alphaNum } from '../alphaNum';

describe('alphaNum validator', () => {
  it('should validate undefined', () => {
    expect(alphaNum.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(alphaNum.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(alphaNum.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(alphaNum.exec(1234567890)).toBe(true);
  });

  it('should not validate space', () => {
    expect(alphaNum.exec(' ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alphaNum.exec('abcxyzABCXYZ')).toBe(true);
  });

  it('should validate english letters', () => {
    expect(alphaNum.exec('abcxyz_ABCXYZ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alphaNum(true).exec('abcxyz_ABCXYZ')).toBe(true);
  });

  it('should validate alphaNum', () => {
    expect(alphaNum.exec('abc123')).toBe(true);
  });

  it('should not validate padded letters', () => {
    expect(alphaNum.exec(' abc ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(alphaNum.exec('🎉')).toBe(false);
  });
});
