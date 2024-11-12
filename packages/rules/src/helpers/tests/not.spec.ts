import type { RegleRuleDefinition } from '@regle/core';
import { minLength, required } from '../../rules';
import { not } from '../not';

describe('not validator', () => {
  it('should not validate with true function', () => {
    expect(not(() => true).exec('test')).toBe(false);
  });
  it('should not validate with required function', () => {
    expect(not(required).exec('test')).toBe(false);
  });
  it('should validate with true function on empty input', () => {
    expect(not(required).exec('')).toBe(true);
  });
  it('should validate with async true function', async () => {
    expect(await not(async () => true).exec('')).toBe(true);
  });
  it('should validate with false function', () => {
    expect(not(() => false).exec('test')).toBe(true);
  });
  it('should validate with async false function', async () => {
    expect(await not(async () => false).exec('test')).toBe(true);
  });
  it('should validate with `false` function on empty input', () => {
    expect(not(() => false).exec('')).toBe(true);
  });

  it('should have correct return types', () => {
    const test = not(() => ({ $valid: true, foo: 'bar' }));
    expectTypeOf(not(() => true)).toEqualTypeOf<
      RegleRuleDefinition<unknown, any[], false, true, unknown>
    >();
    expectTypeOf(not(async () => true)).toEqualTypeOf<
      RegleRuleDefinition<unknown, any[], true, boolean, unknown>
    >();

    expectTypeOf(not(minLength(6))).toEqualTypeOf<
      RegleRuleDefinition<
        string | any[] | Record<PropertyKey, any>,
        [count: number],
        false,
        boolean,
        string | any[] | Record<PropertyKey, any>
      >
    >();

    expectTypeOf(not(() => ({ $valid: true, foo: 'bar' }))).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        any[],
        false,
        {
          $valid: true;
          foo: string;
        },
        unknown
      >
    >();
  });
});
