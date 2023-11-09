import { sameAs } from '../sameAs';

describe('sameAs validator', () => {
  it('should not validate different values', () => {
    expect(sameAs('empty').exec('any')).toBe(false);
  });

  it('should validate identical values', () => {
    expect(sameAs('first').exec('first')).toBe(true);
  });
});
