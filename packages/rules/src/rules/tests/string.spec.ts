import { string } from '../string';

describe('string', () => {
  it('should validate undefined values', () => {
    expect(string.exec(null)).toBe(true);
    expect(string.exec(undefined)).toBe(true);
  });

  it('should validate string value', () => {
    expect(string.exec('hello')).toBe(true);
  });

  it('should not validate other values', () => {
    expect(string.exec(0)).toBe(false);
    expect(string.exec(1)).toBe(false);
  });

  it('should not validate other values', () => {
    expect(string.exec(new Date())).toBe(false);
    expect(string.exec(new Error())).toBe(true);
    expect(string.exec(true)).toBe(false);
    expect(string.exec(false)).toBe(false);
  });
});
