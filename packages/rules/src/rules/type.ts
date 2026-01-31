import type { RegleRuleDefinition, MaybeInput } from '@regle/core';

/**
 * Define the input type of a rule. No runtime validation.
 *
 * Override any input type set by other rules.
 *
 * @example
 * ```ts
 * import { type InferInput } from '@regle/core';
 * import { type } from '@regle/rules';
 *
 * const rules = {
 *   firstName: { type: type<string>() },
 *   status: { type: type<'active' | 'inactive'>() },
 * }
 *
 * const state = ref<InferInput<typeof rules>>({});
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#type Documentation}
 */
export function type<T>(): RegleRuleDefinition<'type', unknown, [], false, boolean, MaybeInput<T>> {
  return (() => true) as any;
}
