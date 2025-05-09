import { startsWith } from '../startsWith';

describe('startsWith validator', () => {
  it('should not validate different values', () => {
    expect(startsWith('ar').exec('bar')).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(startsWith(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(startsWith(undefined).exec('any')).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(startsWith('any').exec(undefined)).toBe(true);
  });

  it('should validate a value containing parameter', () => {
    expect(startsWith('fir').exec('first')).toBe(true);
  });
});
