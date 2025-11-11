import { describe, it, expect } from 'vitest';
import { isDate } from '../utils/isDate';

describe('isDate', () => {
  it('should return true for Date instances', () => {
    expect(isDate(new Date())).toBe(true);
    expect(isDate(new Date('2023-01-01'))).toBe(true);
    expect(isDate(new Date(1672531200000))).toBe(true);
  });

  it('should return true for valid date strings', () => {
    expect(isDate('2023-01-01')).toBe(true);
    expect(isDate('2023-01-01T00:00:00Z')).toBe(true);
    expect(isDate('January 1, 2023')).toBe(true);
    expect(isDate('01/01/2023')).toBe(true);
  });

  it('should return false for invalid date strings', () => {
    expect(isDate('not a date')).toBe(false);
    expect(isDate('2023-13-45')).toBe(false);
    expect(isDate('invalid')).toBe(false);
    expect(isDate('')).toBe(false);
  });

  it('should return false for null', () => {
    expect(isDate(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isDate(undefined)).toBe(false);
  });

  it('should return false for numbers', () => {
    expect(isDate(1234567890)).toBe(false);
    expect(isDate(0)).toBe(false);
    expect(isDate(NaN)).toBe(false);
  });

  it('should return false for objects', () => {
    expect(isDate({})).toBe(false);
    expect(isDate({ date: '2023-01-01' })).toBe(false);
  });

  it('should return false for arrays', () => {
    expect(isDate([])).toBe(false);
    expect(isDate([2023, 1, 1])).toBe(false);
  });

  it('should return false for boolean values', () => {
    expect(isDate(true)).toBe(false);
    expect(isDate(false)).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isDate(new Date('Invalid Date'))).toBe(false);
    expect(isDate(new Date(NaN))).toBe(false);
  });

  it('should return true for various valid date formats', () => {
    expect(isDate('2023-12-25')).toBe(true);
    expect(isDate('2023-12-25T10:30:00')).toBe(true);
    expect(isDate('2023-12-25T10:30:00Z')).toBe(true);
    expect(isDate('2023-12-25T10:30:00+00:00')).toBe(true);
    expect(isDate('Dec 25, 2023')).toBe(true);
  });
});
