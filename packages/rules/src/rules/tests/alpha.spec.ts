import { alpha } from '../alpha';

describe('alpha exec', () => {
  it('should validate undefined', () => {
    expect(alpha.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(alpha.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(alpha.exec('')).toBe(true);
  });

  it('should not validate numbers', () => {
    expect(alpha.exec('1234')).toBe(false);
  });

  it('should not validate space', () => {
    expect(alpha.exec(' ')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alpha.exec('abcdefghijklmnopqrstuvwxyz')).toBe(true);
  });

  it('should validate english letters', () => {
    expect(alpha.exec('abcdefgh_ijklmnopqr_stuvwxyz')).toBe(false);
  });

  it('should validate english letters', () => {
    expect(alpha(true).exec('abcdefgh_ijklmnopqr_stuvwxyz')).toBe(true);
  });

  it('should validate english letters uppercase', () => {
    expect(alpha.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true);
  });

  it('should not validate alphanum', () => {
    expect(alpha.exec('abc123')).toBe(false);
  });

  it('should not validate padded letters', () => {
    expect(alpha.exec(' abc ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(alpha.exec('🎉')).toBe(false);
  });
});
