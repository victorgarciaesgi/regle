import { boolean } from '../boolean';

describe('boolean', () => {
  it('should not validate undefined values', () => {
    expect(boolean.exec(null)).toBe(true);
    expect(boolean.exec(undefined)).toBe(true);
  });

  it('should validate true value', () => {
    expect(boolean.exec(true)).toBe(true);
  });

  it('should not validate false value', () => {
    expect(boolean.exec(false)).toBe(true);
  });

  it('should not validate other values', () => {
    expect(boolean.exec(0)).toBe(false);
    expect(boolean.exec(1)).toBe(false);
    expect(boolean.exec(new Date())).toBe(false);
  });
});
