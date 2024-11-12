import { requiredUnless } from '../requiredUnless';
import { ref } from 'vue';

describe('requiredUnless validator', () => {
  it('should not validate if prop is falsy', () => {
    expect(requiredUnless(false).exec('')).toBe(false);
    expect(requiredUnless(false).exec('truthy value')).toBe(true);
  });

  it('should not validate when prop condition is truthy', async () => {
    expect(requiredUnless(true).exec('')).toBe(true);
    expect(requiredUnless(true).exec('truthy value')).toBe(true);
  });

  it('should validate string only with spaces', () => {
    expect(requiredUnless(false).exec('  ')).toBe(false);
  });

  it('should work with a ref', () => {
    const prop = ref(true);
    expect(requiredUnless(prop).exec(true)).toBe(true);
    prop.value = false;
    expect(requiredUnless(prop).exec('')).toBe(false);
    expect(requiredUnless(prop).exec('1')).toBe(true);
  });
});
