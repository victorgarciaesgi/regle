import type { RegleRuleDefinition } from '@regle/core';
import { timeout } from '../../../../../tests/utils';
import { email, minLength, required } from '../../rules';
import { or } from '../or';
import type { CommonComparationOptions } from '@regle/core';

describe('or validator', () => {
  it('should not validate no functions', () => {
    // @ts-expect-error
    const result = or();

    expect(result.exec(undefined)).toBe(false);
  });

  it('should validate one validators', () => {
    const result = or(required);
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('foo')).toBe(true);
  });

  it('should validate 2 validators', () => {
    const result = or(required, email);
    expect(result).not.toBe(Function);
    expect(result.exec(undefined)).toBe(true);
    expect(result.exec('foo@free.fr')).toBe(true);
  });

  it('should validate 3 validators', () => {
    const result = or(required, email, minLength(6));
    expect(result.exec(undefined)).toBe(true);
    expect(result.exec('foo@free.fr')).toBe(true);
  });

  it('should validate if one validators fails', () => {
    const result = or(required, email, minLength(6));
    expect(result.exec(undefined)).toBe(true);
    expect(result.exec('fooffffff')).toBe(true);
  });

  it('should validate if two validators fails', () => {
    const result = or(required, email, minLength(6));
    expect(result.exec(undefined)).toBe(true);
    expect(result.exec('fof')).toBe(true);
  });

  it('should validate inline function', () => {
    const result = or((value: unknown) => ({ $valid: true, foo: 'bar' }), required);
    expect(result.exec(undefined)).toBe(true);
    expect(result.exec('fof')).toBe(true);
  });

  it('should validate async function', async () => {
    const result = or(async (value: unknown) => {
      await timeout(100);
      return false;
    }, required);
    expect(await result.exec(undefined)).toBe(false);
    expect(await result.exec('fof')).toBe(true);
  });

  it('should have correct return types', () => {
    // @ts-expect-error
    or();
    expectTypeOf(or(required)).toEqualTypeOf<RegleRuleDefinition<unknown, [], false, boolean, unknown>>();
    expectTypeOf(or(required, email, minLength(6))).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        [count: number, options?: CommonComparationOptions | undefined],
        false,
        boolean,
        unknown
      >
    >();
  });
});
