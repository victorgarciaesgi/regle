import type { RegleRuleDefinition, MaybeInput } from '@regle/core';

/**
 * Define the input type of a rule
 *
 * Necessary for using `InferState`
 */
export function type<T>(): RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<T>> {
  return (() => true) as any;
}
