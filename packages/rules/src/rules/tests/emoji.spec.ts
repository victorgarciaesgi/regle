import { emoji } from '../emoji';

describe('emoji validator', () => {
  it('should validate undefined', () => {
    expect(emoji.exec(undefined)).toBe(true);
  });

  it('should validate null', () => {
    expect(emoji.exec(null)).toBe(true);
  });

  it('should validate empty string', () => {
    expect(emoji.exec('')).toBe(true);
  });

  it('should validate single emoji', () => {
    expect(emoji.exec('😀')).toBe(true);
  });

  it('should validate multiple emojis', () => {
    expect(emoji.exec('🔥💯')).toBe(true);
  });

  it('should validate complex emoji (family)', () => {
    expect(emoji.exec('👨‍👩‍👧‍👦')).toBe(true);
  });

  it('should not validate text', () => {
    expect(emoji.exec('hello')).toBe(false);
  });

  it('should not validate mixed content', () => {
    expect(emoji.exec('hello 😀')).toBe(false);
  });

  it('should validate digit emoji components', () => {
    // Digits are valid emoji components (used in keycap emojis)
    expect(emoji.exec('123')).toBe(true);
  });
});
