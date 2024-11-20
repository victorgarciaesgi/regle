import { checked } from '../checked';

describe('checked validator', () => {
  it('should not validate undefined values', () => {
    expect(checked.exec(null)).toBe(true);
    expect(checked.exec(undefined)).toBe(true);
  });

  it('should validate true value', () => {
    expect(checked.exec(true)).toBe(true);
  });

  it('should not validate false value', () => {
    expect(checked.exec(false)).toBe(false);
  });
});
