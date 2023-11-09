import { requiredIf } from '../requiredIf';
import { ref } from 'vue';

describe('requiredIf validator', () => {
  it('should not validate empty string when functional condition is met', () => {
    expect(requiredIf(true).exec('')).toBe(false);
  });

  it('should validate empty string when functional condition not met', () => {
    expect(requiredIf(false).exec('')).toBe(true);
  });

  it('should not validate empty string when simple boolean condition is met', () => {
    // @ts-expect-error
    expect(requiredIf('prop').exec('')).toBe(false);
  });

  it('should validate empty string when simple boolean condition not met', () => {
    // @ts-expect-error
    expect(requiredIf('').exec('')).toBe(true);
  });

  it('should validate string only with spaces', () => {
    expect(requiredIf(true).exec('  ')).toBe(false);
  });

  it('should work with a ref', () => {
    const prop = ref(false);
    // make sure if passed a `false` ref, it returns `true` directly
    expect(requiredIf(prop).exec(false)).toBe(true);
    prop.value = true;
    expect(requiredIf(prop).exec('')).toBe(false);
    expect(requiredIf(prop).exec('1')).toBe(true);
  });
});
