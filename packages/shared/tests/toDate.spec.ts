import { describe, it, expect } from 'vitest';
import { toDate } from '../utils/toDate';

describe('toDate', () => {
  it('should convert Date instances', () => {
    const date = new Date('2023-01-01');
    const result = toDate(date);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(date.getTime());
    expect(result).not.toBe(date);
  });

  it('should convert number timestamps', () => {
    const timestamp = 1672531200000; // 2023-01-01
    const result = toDate(timestamp);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(timestamp);
  });

  it('should convert date strings', () => {
    const dateString = '2023-01-01';
    const result = toDate(dateString);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(new Date(dateString).getTime());
  });

  it('should handle various date string formats', () => {
    expect(toDate('2023-01-01')).toBeInstanceOf(Date);
    expect(toDate('2023-01-01T00:00:00Z')).toBeInstanceOf(Date);
    expect(toDate('January 1, 2023')).toBeInstanceOf(Date);
    expect(toDate('01/01/2023')).toBeInstanceOf(Date);
  });

  it('should return invalid date for null', () => {
    const result = toDate(null);
    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('should return invalid date for undefined', () => {
    const result = toDate(undefined);
    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('should handle Date objects created with new Date()', () => {
    const date = new Date();
    const result = toDate(date);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(date.getTime());
  });

  it('should handle number objects', () => {
    const numberObj = new Number(1672531200000);
    const result = toDate(numberObj as any);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(1672531200000);
  });

  it('should handle string objects', () => {
    const stringObj = new String('2023-01-01');
    const result = toDate(stringObj as any);

    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(new Date('2023-01-01').getTime());
  });

  it('should return invalid date for invalid input', () => {
    const result1 = toDate({} as any);
    const result2 = toDate([] as any);
    const result3 = toDate(true as any);
    const result4 = toDate(false as any);

    expect(result1).toBeInstanceOf(Date);
    expect(isNaN(result1.getTime())).toBe(true);

    expect(result2).toBeInstanceOf(Date);
    expect(isNaN(result2.getTime())).toBe(true);

    expect(result3).toBeInstanceOf(Date);
    expect(isNaN(result3.getTime())).toBe(true);

    expect(result4).toBeInstanceOf(Date);
    expect(isNaN(result4.getTime())).toBe(true);
  });

  it('should handle zero timestamp', () => {
    const result = toDate(0);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(0);
  });

  it('should handle negative timestamps', () => {
    const result = toDate(-1000);
    expect(result).toBeInstanceOf(Date);
    expect(result.getTime()).toBe(-1000);
  });

  it('should handle invalid date strings', () => {
    const result = toDate('invalid date string');
    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result.getTime())).toBe(true);
  });

  it('should preserve timezone information for date strings', () => {
    const dateString = '2023-01-01T12:00:00Z';
    const result = toDate(dateString);

    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe('2023-01-01T12:00:00.000Z');
  });
});
