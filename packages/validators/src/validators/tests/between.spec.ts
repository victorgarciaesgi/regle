import { between } from '../between';

describe('between validator', () => {
  it('should validate empty string', () => {
    expect(between(2, 3).exec(2)).toBe(true);
  });

  it('should validate numeric zero in range', () => {
    expect(between(-1, 1).exec(0)).toBe(true);
  });

  it('should not validate numeric zero outside of range', () => {
    expect(between(2, 3).exec(0)).toBe(false);
  });

  it('should not validate input outside of range', () => {
    expect(between(5, 10).exec(15)).toBe(false);
    expect(between(5, 10).exec(3)).toBe(false);
  });

  it('should have inclusive lower bound', () => {
    expect(between(5, 10).exec(5)).toBe(true);
  });

  it('should have inclusive upper bound', () => {
    expect(between(3, 4).exec(4)).toBe(true);
  });

  it('should validate exact number in point range', () => {
    expect(between(3, 3).exec(3)).toBe(true);
  });

  it('should not validate number just outside of range', () => {
    expect(between(3, 3).exec(3)).toBe(true);
  });

  it('should not validate space', () => {
    expect(between(3, 3).exec('' as any)).toBe(false);
  });

  it('should not validate text', () => {
    expect(between(3, 3).exec('hello' as any)).toBe(false);
  });

  it('should not validate number-like text', () => {
    expect(between(3, 3).exec('15a' as any)).toBe(false);
  });

  it('should not validate padded numbers', () => {
    expect(between(5, 20).exec(' 15' as any)).toBe(false);
    expect(between(5, 20).exec('15 ' as any)).toBe(false);
  });

  it('should validate fractions', () => {
    expect(between(3, 16).exec('15.5' as any)).toBe(true);
  });

  it('should validate negative fractions on bound', () => {
    expect(between(-15.512, 4.56).exec('-15.512' as any)).toBe(true);
  });

  it('should validate real numbers', () => {
    expect(between(3, 16).exec(15.5)).toBe(true);
  });

  it('should not validate real numbers outside of range', () => {
    expect(between(3, 16).exec(25.5)).toBe(false);
  });

  it('should not validate NaN', () => {
    expect(between(3, 16).exec(NaN)).toBe(false);
  });
});
