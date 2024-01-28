import { RegleRuleDefinition } from '@regle/core';
import { timeout } from '../../../../../tests/utils';
import { email, minLength, required } from '../../validators';
import { and } from '../and';

describe('and validator', () => {
  it('should not validate no functions', () => {
    const result = and();

    expect(result.exec(undefined)).toBe(false);
  });

  it('should validate one validators', () => {
    const result = and(required);
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('foo')).toBe(true);
  });

  it('should validate 2 validators', () => {
    const result = and(required, email);
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('foo@free.fr')).toBe(true);
  });

  it('should validate 3 validators', () => {
    const result = and(required, email, minLength(6));
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('foo@free.fr')).toBe(true);
  });

  it('should not validate if one validators fails', () => {
    const result = and(required, email, minLength(6));
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('fooffffff')).toBe(false);
  });

  it('should not validate if two validators fails', () => {
    const result = and(required, email, minLength(6));
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('fof')).toBe(false);
  });

  it('should validate inline function', () => {
    const result = and((value) => ({ $valid: true, foo: 'bar' }), required);
    expect(result.exec(undefined)).toBe(false);
    expect(result.exec('fof')).toBe(true);
  });

  it('should validate async function', async () => {
    const result = and(async (value) => {
      await timeout(100);
      return false;
    }, required);
    expect(await result.exec(undefined)).toBe(false);
    expect(await result.exec('fof')).toBe(false);
  });

  it('should have correct return types', () => {
    expectTypeOf(and()).toEqualTypeOf<RegleRuleDefinition<never, [], false, boolean, never>>();
    expectTypeOf(and(required)).toEqualTypeOf<
      RegleRuleDefinition<unknown, [], false, boolean, unknown>
    >();
    expectTypeOf(and(required, email, minLength(6))).toEqualTypeOf<
      RegleRuleDefinition<unknown, [number], false, boolean, unknown>
    >();

    expectTypeOf(and()).toEqualTypeOf<RegleRuleDefinition<never, [], false, boolean, never>>();
  });
});
