import { sameAs } from '../sameAs';

describe('sameAs validator', () => {
  it('should not validate different values', () => {
    expect(sameAs('empty').exec('any')).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(sameAs(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(sameAs(undefined).exec('any')).toBe(false);
  });

  it('should validate undefined value', () => {
    expect(sameAs('any').exec(undefined)).toBe(true);
  });

  it('should validate identical values', () => {
    expect(sameAs('first').exec('first')).toBe(true);
  });
});
