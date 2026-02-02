import { required } from '../required';

describe('required validator', () => {
  it('should not validate empty string', () => {
    expect(required.exec('')).toBe(false);
  });

  it('should not validate empty arrays', () => {
    expect(required.exec([])).toBe(false);
  });

  it('should validate nonempty arrays', () => {
    expect(required.exec([1])).toBe(true);
  });

  it('should not validate empty objects', () => {
    expect(required.exec({})).toBe(true);
  });

  it('should validate nonempty objects', () => {
    expect(required.exec({ a: 1 })).toBe(true);
  });

  it('should not validate undefined', () => {
    expect(required.exec(undefined)).toBe(false);
  });

  it('should not validate null', () => {
    expect(required.exec(null)).toBe(false);
  });

  it('should validate false', () => {
    expect(required.exec(false)).toBe(true);
  });

  it('should validate true', () => {
    expect(required.exec(true)).toBe(true);
  });

  it('should validate string only with spaces', () => {
    expect(required.exec('  ')).toBe(false);
  });

  it('should validate english words', () => {
    expect(required.exec('hello')).toBe(true);
  });

  it('should validate padded words', () => {
    expect(required.exec(' hello ')).toBe(true);
  });

  it('should validate unicode', () => {
    expect(required.exec('🎉')).toBe(true);
  });

  it('should validate correct date', () => {
    expect(required.exec(new Date(1234123412341))).toBe(true);
  });

  it('should not validate invalid date', () => {
    expect(required.exec(new Date('a'))).toBe(false);
  });
});
