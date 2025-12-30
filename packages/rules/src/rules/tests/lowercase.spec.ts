import { lowercase } from '../lowercase';

describe('lowercase validator', () => {
  it('should validate undefined', () => {
    expect(lowercase.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(lowercase.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(lowercase.exec('')).toBe(true);
  });

  it('should validate lowercase string', () => {
    expect(lowercase.exec('hello')).toBe(true);
  });

  it('should validate lowercase with spaces', () => {
    expect(lowercase.exec('hello world')).toBe(true);
  });

  it('should validate lowercase with numbers', () => {
    expect(lowercase.exec('test123')).toBe(true);
  });

  it('should validate lowercase with symbols', () => {
    expect(lowercase.exec('hello-world_123')).toBe(true);
  });

  it('should not validate uppercase at start', () => {
    expect(lowercase.exec('Hello')).toBe(false);
  });

  it('should not validate all uppercase', () => {
    expect(lowercase.exec('HELLO')).toBe(false);
  });

  it('should not validate camelCase', () => {
    expect(lowercase.exec('helloWorld')).toBe(false);
  });
});
