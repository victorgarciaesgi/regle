import { hexadecimal } from '../hexadecimal';

describe('hexadecimal validator', () => {
  it('should validate undefined', () => {
    expect(hexadecimal.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(hexadecimal.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(hexadecimal.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(hexadecimal.exec('01234')).toBe(true);
  });

  it('should not validate space', () => {
    expect(hexadecimal.exec(' ')).toBe(false);
  });

  it('should not validate english letters', () => {
    expect(hexadecimal.exec('abcdefghijklmnopqrstuvwxyz')).toBe(false);
  });

  it('should not validate english letters uppercase', () => {
    expect(hexadecimal.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(false);
  });

  it('should not validate padded numbers', () => {
    expect(hexadecimal.exec(' 123 ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(hexadecimal.exec('🎉')).toBe(false);
  });

  it('should not validate negative numbers', () => {
    expect(hexadecimal.exec('-123')).toBe(false);
  });

  it('should validate hexadecimal values', () => {
    expect(hexadecimal.exec('ABCDEF')).toBe(true);
    expect(hexadecimal.exec('c0ffee03')).toBe(true);
  });
});
