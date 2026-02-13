import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { type } from '../type';

describe('type', () => {
  it('should always return true at runtime', () => {
    const typeRule = type<string>();
    const runtimeTypeRule = typeRule as any;

    expect(runtimeTypeRule('hello')).toBe(true);
    expect(runtimeTypeRule(123)).toBe(true);
    expect(runtimeTypeRule(undefined)).toBe(true);
  });

  const inferredTypeRule = type<string>();
  expectTypeOf(inferredTypeRule).toEqualTypeOf<
    RegleRuleDefinition<'type', unknown, [], false, boolean, MaybeInput<string>>
  >();
});
