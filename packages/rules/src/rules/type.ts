import type { RegleRuleDefinition } from '@regle/core';

/**
 * Define the input type of a rule
 *
 * Necessary for using `InferState`
 */
export function type<T>(): RegleRuleDefinition<unknown, [], false, boolean, T> {
  return (() => true) as any;
}
