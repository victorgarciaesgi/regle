import type { RegleRuleDefinition, MaybeInput } from '@regle/core';

/**
 * Define the input type of a rule. No runtime validation.
 *
 * Override any input type set by other rules.
 */
export function type<T>(): RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<T>> {
  return (() => true) as any;
}
