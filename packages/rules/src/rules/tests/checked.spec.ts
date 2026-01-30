import { checked } from '../checked';

describe('checked validator', () => {
  it('should not validate undefined values', () => {
    expect(checked.exec(null)).toBe(false);
    expect(checked.exec(undefined)).toBe(false);
  });

  it('should validate true value', () => {
    expect(checked.exec(true)).toBe(true);
  });

  it('should not validate false value', () => {
    expect(checked.exec(false)).toBe(false);
  });
});
