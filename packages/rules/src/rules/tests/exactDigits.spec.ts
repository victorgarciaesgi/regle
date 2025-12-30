import { exactDigits } from '../exactDigits';

describe('exactDigits validator', () => {
  it('should validate empty string', () => {
    expect(exactDigits(5).exec('')).toBe(true);
  });

  it('should validate null', () => {
    expect(exactDigits(5).exec(null)).toBe(true);
  });

  it('should validate undefined', () => {
    expect(exactDigits(5).exec(undefined)).toBe(true);
  });

  it('should validate exact number of digits', () => {
    expect(exactDigits(5).exec('12345')).toBe(true);
  });

  it('should validate exact number of digits as number', () => {
    expect(exactDigits(5).exec(12345)).toBe(true);
  });

  it('should not validate too few digits', () => {
    expect(exactDigits(5).exec('1234')).toBe(false);
  });

  it('should not validate too many digits', () => {
    expect(exactDigits(5).exec('123456')).toBe(false);
  });

  it('should validate single digit', () => {
    expect(exactDigits(1).exec('5')).toBe(true);
  });

  it('should validate single digit as number', () => {
    expect(exactDigits(1).exec(5)).toBe(true);
  });

  it('should not validate string param', () => {
    expect(exactDigits('eee' as any).exec('12345')).toBe(false);
  });

  it('should not validate letters', () => {
    expect(exactDigits(5).exec('abcde')).toBe(false);
  });

  it('should not validate alphanumeric', () => {
    expect(exactDigits(5).exec('abc12')).toBe(false);
  });

  it('should validate spaces', () => {
    expect(exactDigits(5).exec('     ')).toBe(true);
  });

  it('should not validate padded digits', () => {
    expect(exactDigits(5).exec(' 12345 ')).toBe(false);
  });

  it('should not validate decimal numbers', () => {
    expect(exactDigits(5).exec('123.5')).toBe(false);
  });

  it('should not validate negative numbers', () => {
    expect(exactDigits(5).exec('-1234')).toBe(false);
  });

  it('should validate zero', () => {
    expect(exactDigits(1).exec('0')).toBe(true);
    expect(exactDigits(1).exec(0)).toBe(true);
  });

  it('should validate leading zeros', () => {
    expect(exactDigits(5).exec('00123')).toBe(true);
  });

  it('should not validate unicode', () => {
    expect(exactDigits(1).exec('🎉')).toBe(false);
  });

  it('should validate with count of 0 for empty input', () => {
    expect(exactDigits(0).exec('')).toBe(true);
  });

  it('should not validate digits when count is 0', () => {
    expect(exactDigits(0).exec('1')).toBe(false);
  });
});
