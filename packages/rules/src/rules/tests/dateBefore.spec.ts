import { dateBefore } from '../dateBefore';

describe('dateBefore validator', () => {
  it('should validate undefined value and param', () => {
    expect(dateBefore(undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined param', () => {
    expect(dateBefore(undefined).exec(new Date())).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBefore(new Date()).exec(undefined)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBefore('').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateBefore('abde').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateBefore('abde').exec('ezezfnr')).toBe(false);
  });

  it('should not validate wrong number value', () => {
    expect(dateBefore(101929020 as any).exec(new Date().getTime() as any)).toBe(false);
  });

  it('should not validate wrong type', () => {
    expect(dateBefore(true as any).exec(true as any)).toBe(false);
  });

  it('should validate a date before', () => {
    expect(dateBefore(new Date(2013)).exec(new Date(2012))).toBe(true);
  });

  it('should not validate a date after', () => {
    expect(dateBefore(new Date(2013)).exec(new Date(2014))).toBe(false);
  });

  it('should not validate an identical date', () => {
    expect(dateBefore(new Date(2013)).exec(new Date(2013))).toBe(false);
  });
});
