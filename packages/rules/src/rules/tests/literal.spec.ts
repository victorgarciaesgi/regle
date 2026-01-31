import { literal } from '../literal';
import type { RegleRuleDefinition, MaybeInput } from '@regle/core';

describe('literal validator', () => {
  it('should not validate invalid value', () => {
    expect(literal('ONE').exec(5)).toBe(false);
  });

  it('should validate valid string', () => {
    expect(literal('Two').exec('Two')).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(literal(4).exec(4)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(literal('ONE').exec(undefined)).toBe(true);
  });

  it('should validate undefined option', () => {
    expect(literal(undefined as any).exec(5)).toBe(true);
  });

  const literalRule = literal('Foo');
  expectTypeOf(literalRule).toEqualTypeOf<
    RegleRuleDefinition<'literal', 'Foo', [literal: 'Foo'], false, boolean, MaybeInput<'Foo'>, string | number, true>
  >();
});
