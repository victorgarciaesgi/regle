import { dateBetween } from '../dateBetween';

describe('dateBetween validator', () => {
  it('should validate undefined value and param', () => {
    expect(dateBetween(undefined, undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined param', () => {
    expect(dateBetween(undefined, undefined).exec(new Date())).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBetween(new Date(), undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateBetween('', '').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateBetween('abde', 'abcde').exec('')).toBe(true);
  });

  it('should validate a date between', () => {
    expect(dateBetween(new Date(2013), new Date(2015)).exec(new Date(2014))).toBe(true);
  });

  it('should not validate a date after', () => {
    expect(dateBetween(new Date(2013), new Date(2015)).exec(new Date(2012))).toBe(false);
  });

  it('should not validate an identical date', () => {
    expect(dateBetween(new Date(2013), new Date(2015)).exec(new Date(2013))).toBe(false);
  });

  it('should validate an identical date with allowEqual', () => {
    const rule = dateBetween(new Date(2013), new Date(2015), { allowEqual: true });
    expect(rule.exec(new Date(2013))).toBe(true);
    expect(rule.exec(new Date(2015))).toBe(true);
  });
});
