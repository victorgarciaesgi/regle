import { dateAfter } from '../dateAfter';

describe('dateAfter validator', () => {
  it('should validate undefined value and param', () => {
    expect(dateAfter(undefined).exec(undefined)).toBe(true);
  });

  it('should validate undefined param', () => {
    expect(dateAfter(undefined).exec(new Date())).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateAfter(new Date()).exec(undefined)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(dateAfter('').exec('')).toBe(true);
  });

  it('should not validate string value', () => {
    expect(dateAfter('abde').exec('')).toBe(true);
  });

  it('should validate a date after', () => {
    expect(dateAfter(new Date(2013)).exec(new Date(2014))).toBe(true);
  });

  it('should not validate a date before', () => {
    expect(dateAfter(new Date(2013)).exec(new Date(2012))).toBe(false);
  });

  it('should validate an identical date', () => {
    expect(dateAfter(new Date(2013)).exec(new Date(2013))).toBe(true);
  });

  it('should not validate an identical date without allowEqual', () => {
    expect(dateAfter(new Date(2013), { allowEqual: false }).exec(new Date(2013))).toBe(false);
  });
});
