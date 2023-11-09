import { integer } from '../integer';

describe('integer validator', () => {
  it('should validate undefined', () => {
    expect(integer.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(integer.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(integer.exec('')).toBe(true);
  });

  it('should validate numbers', () => {
    expect(integer.exec('01234')).toBe(true);
  });

  it('should not validate space', () => {
    expect(integer.exec(' ')).toBe(false);
  });

  it('should not validate english letters', () => {
    expect(integer.exec('abcdefghijklmnopqrstuvwxyz')).toBe(false);
  });

  it('should not validate english letters uppercase', () => {
    expect(integer.exec('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(false);
  });

  it('should not validate alphanum', () => {
    expect(integer.exec('abc123')).toBe(false);
  });

  it('should not validate padded letters', () => {
    expect(integer.exec(' 123 ')).toBe(false);
  });

  it('should not validate unicode', () => {
    expect(integer.exec('🎉')).toBe(false);
  });

  it('should not validate minus sign', () => {
    expect(integer.exec('-')).toBe(false);
  });

  it('should validate negative numbers', () => {
    expect(integer.exec('-123')).toBe(true);
  });

  it('should not validate decimal numbers', () => {
    expect(integer.exec('0.1')).toBe(false);
    expect(integer.exec('1.0')).toBe(false);
  });

  it('should not validate negative decimal numbers', () => {
    expect(integer.exec('-123.4')).toBe(false);
  });
});
