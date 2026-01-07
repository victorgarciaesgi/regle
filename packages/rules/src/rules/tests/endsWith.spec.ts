import { endsWith } from '../endsWith';

describe('endsWith validator', () => {
  it('should not validate different values', () => {
    expect(endsWith('ba').exec('bar')).toBe(false);
  });

  it('should not validate undefined values', () => {
    expect(endsWith(undefined).exec(undefined)).toBe(true);
  });

  it('should not validate undefined param', () => {
    expect(endsWith(undefined).exec('any')).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(endsWith('any').exec(undefined)).toBe(true);
  });

  it('should validate a value containing parameter', () => {
    expect(endsWith('st').exec('first')).toBe(true);
  });

  it('should skip non-string param', () => {
    expect(endsWith('any').exec(123 as any)).toBe(true);
  });

  it('should skip non-string value', () => {
    expect(endsWith('any').exec(123 as any)).toBe(true);
  });
});
