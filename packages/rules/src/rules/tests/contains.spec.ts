import { contains } from '../contains';

describe('contains validator', () => {
  it('should not validate different values', () => {
    expect(contains('foo').exec('bar')).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(contains(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(contains(undefined).exec('any')).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(contains('any').exec(undefined)).toBe(true);
  });

  it('should validate a value containing parameter', () => {
    expect(contains('ir').exec('first')).toBe(true);
  });
});
