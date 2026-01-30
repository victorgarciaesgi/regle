import type { RegleRuleDefinition } from '@regle/core';
import { timeout } from '../../../../../tests/utils';
import { email, minLength, required, startsWith, contains } from '../../rules';
import { xor } from '../xor';
import type { CommonComparisonOptions } from '@regle/core';

describe('xor validator', () => {
  it('should not validate no functions', () => {
    // @ts-expect-error at least one argument
    const result = xor();

    expect(result.exec(undefined)).toBe(false);
  });

  it('should validate one validator (acts like the single validator)', () => {
    const result = xor(required);
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('foo')).toBe(true);
  });

  it('should validate 2 validators - exactly one passes', () => {
    const result = xor(contains('A'), contains('B'));
    expect(result).not.toBe(Function);
    expect(result.exec('C')).toBe(false);
    expect(result.exec('A')).toBe(true);
    expect(result.exec('B')).toBe(true);
    expect(result.exec('AB')).toBe(false);
  });

  it('should validate 3 validators - exactly one passes', () => {
    const result = xor(contains('A'), contains('B'), contains('C'));
    expect(result.exec('D')).toBe(false);
    expect(result.exec('A')).toBe(true);
    expect(result.exec('B')).toBe(true);
    expect(result.exec('C')).toBe(true);
    expect(result.exec('AB')).toBe(false);
    expect(result.exec('AC')).toBe(false);
    expect(result.exec('BC')).toBe(false);
    expect(result.exec('ABC')).toBe(false);
  });

  it('should not validate if no validators pass', () => {
    const result = xor(required, email, minLength(6));
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('')).toBe(false);
  });

  it('should not validate if all validators pass', () => {
    const result = xor(required, email, minLength(6));
    expect(result.exec('foo@free.fr')).toBe(false);
  });

  it('should validate if exactly one validator passes', () => {
    const result = xor(startsWith('X'), email);
    expect(result.exec('foo@free.fr')).toBe(true);
    expect(result.exec('Xfoo')).toBe(true);
    expect(result.exec('X@free.fr')).toBe(false);
  });

  it('should validate inline function', () => {
    const result = xor((_value: unknown) => ({ $valid: true, foo: 'bar' }), required);
    expect(result.exec('fof')).toBe(false);
    expect(result.exec(undefined)).toBe(true);
  });

  it('should validate async function', async () => {
    const result = xor(async (_value: unknown) => {
      await timeout(100);
      return true;
    }, required);
    expect(await result.exec('fof')).toBe(false);
    expect(await result.exec(undefined)).toBe(true);
  });

  it('should have correct return types', () => {
    // @ts-expect-error at least one argument
    xor();
    expectTypeOf(xor(required)).toEqualTypeOf<RegleRuleDefinition<unknown, [], false, boolean, unknown>>();
    expectTypeOf(xor(required, email, minLength(6))).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        [count: number, options?: CommonComparisonOptions | undefined],
        false,
        boolean,
        unknown
      >
    >();
  });
});
