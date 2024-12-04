import { minLength } from '../minLength';

describe('minLength validator', () => {
  it('should validate empty string', () => {
    expect(minLength(5).exec('')).toBe(true);
  });

  it('should validate null', () => {
    expect(minLength(5).exec(null)).toBe(true);
  });

  it('should not validate too short string', () => {
    expect(minLength(5).exec('a')).toBe(false);
  });

  it('should not validate string param', () => {
    expect(minLength('eee' as any).exec('eeeeee')).toBe(false);
  });

  it('should validate enough characters', () => {
    expect(minLength(5).exec('abcde')).toBe(true);
  });

  it('should validate more than necessary characters', () => {
    expect(minLength(5).exec('abcdefghi')).toBe(true);
  });

  it('should validate enough spaces', () => {
    expect(minLength(5).exec('     ')).toBe(true);
  });

  it('should validate empty arrays', () => {
    expect(minLength(5).exec([])).toBe(false);
  });

  it('should not validate too short arrays', () => {
    expect(minLength(5).exec([1])).toBe(false);
  });

  it('should validate arrays with enough elements', () => {
    expect(minLength(5).exec([1, 2, 3, 4, 5])).toBe(true);
  });

  it('should validate empty objects', () => {
    expect(minLength(5).exec({})).toBe(true);
  });

  it('should not validate too short objects', () => {
    expect(minLength(5).exec({ a: 1 })).toBe(false);
  });

  it('should validate objects with enough elements', () => {
    expect(minLength(5).exec({ a: 1, b: 2, c: 3, d: 4, e: 5 })).toBe(true);
  });
});
