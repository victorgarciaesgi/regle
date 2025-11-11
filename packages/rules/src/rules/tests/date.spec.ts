import { date } from '../date';

describe('date', () => {
  it('should not validate undefined values', () => {
    expect(date.exec(null)).toBe(true);
    expect(date.exec(undefined)).toBe(true);
  });

  it('should validate Date value', () => {
    expect(date.exec(new Date())).toBe(true);
  });

  it('should not validate other values', () => {
    expect(date.exec(0)).toBe(false);
    expect(date.exec(1)).toBe(false);
    expect(date.exec(true)).toBe(false);
    expect(date.exec(false)).toBe(false);
  });
});
