import { uppercase } from '../uppercase';

describe('uppercase validator', () => {
  it('should validate undefined', () => {
    expect(uppercase.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(uppercase.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(uppercase.exec('')).toBe(true);
  });

  it('should validate uppercase string', () => {
    expect(uppercase.exec('HELLO')).toBe(true);
  });

  it('should validate uppercase with spaces', () => {
    expect(uppercase.exec('HELLO WORLD')).toBe(true);
  });

  it('should validate uppercase with numbers', () => {
    expect(uppercase.exec('TEST123')).toBe(true);
  });

  it('should validate uppercase with symbols', () => {
    expect(uppercase.exec('HELLO-WORLD_123')).toBe(true);
  });

  it('should not validate lowercase at start', () => {
    expect(uppercase.exec('Hello')).toBe(false);
  });

  it('should not validate all lowercase', () => {
    expect(uppercase.exec('hello')).toBe(false);
  });

  it('should not validate mixed case', () => {
    expect(uppercase.exec('HELLOworld')).toBe(false);
  });
});
