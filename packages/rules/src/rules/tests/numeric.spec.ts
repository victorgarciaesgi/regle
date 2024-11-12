import { numeric } from '../numeric';

describe('numeric validator', () => {
  it('should validate undefined', () => {
    expect(numeric.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(numeric.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(numeric.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(numeric.exec('01234')).toBe(true);
  });

  it('should not validate space', () => {
    expect(numeric.exec(' ')).toBe(false);
  });

  it('should not validate english letters', () => {
    expect(numeric.exec('abcdefghijklmnopqrstuvwxyz')).toBe(false);
  });

  it('should not validate english letters uppercase', () => {
    expect(numeric.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(false);
  });

  it('should not validate alphanum', () => {
    expect(numeric.exec('abc123')).toBe(false);
  });

  it('should not validate padded letters', () => {
    expect(numeric.exec(' 123 ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(numeric.exec('🎉')).toBe(false);
  });

  it('should not validate negative numbers', () => {
    expect(numeric.exec('-123')).toBe(false);
  });

  it('should validate decimal numbers', () => {
    expect(numeric.exec('0.1')).toBe(true);
    expect(numeric.exec('1.0')).toBe(true);
  });

  it('should not validate negative decimal numbers', () => {
    expect(numeric.exec('-123.4')).toBe(false);
  });
});
