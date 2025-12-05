import type { Merge } from 'type-fest';
import { merge } from '../../../shared';
import type { InferInput, ReglePartialRuleTree, RegleUnknownRulesTree } from '../types';
import type { Ref } from 'vue';

/**
 * Helper method to wrap a raw rules object with type inference.
 * Provides autocomplete and type-checking without processing.
 *
 * @param rules - The rules object to wrap
 * @returns The same rules object (passthrough)
 *
 * @example
 * ```ts
 * import { defineRules } from '@regle/core';
 * import { required, string } from '@regle/rules';
 *
 * // defineRules helps catch structure errors
 * const rules = defineRules({
 *   firstName: { required, string },
 *   lastName: { required, string }
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/common-usage/standard-schema Documentation}
 */
export function defineRules<TRules extends RegleUnknownRulesTree>(rules: TRules): TRules {
  return rules;
}

/**
 * Refine a rules object to add rules that depend on the state values.
 * Inspired by Zod's `refine`, this allows writing dynamic rules while maintaining type safety.
 *
 * @param rules - The base rules object
 * @param refinement - A function that receives the typed state and returns additional rules
 * @returns A function that, given the state ref, returns the merged rules
 *
 * @example
 * ```ts
 * import { refineRules, type InferInput } from '@regle/core';
 * import { required, string, sameAs } from '@regle/rules';
 *
 * const rules = refineRules({
 *   password: { required, string },
 * }, (state) => ({
 *   // state is typed based on the base rules
 *   confirmPassword: {
 *     required,
 *     sameAs: sameAs(() => state.value.password)
 *   }
 * }));
 *
 * type State = InferInput<typeof rules>;
 * // { password: string; confirmPassword: string }
 * ```
 *
 * @see {@link https://reglejs.dev/common-usage/standard-schema#refinerules Documentation}
 */
export function refineRules<
  TRules extends RegleUnknownRulesTree,
  TRefinement extends ReglePartialRuleTree<InferInput<TRules>> & RegleUnknownRulesTree,
>(
  rules: TRules,
  refinement: (state: Ref<InferInput<TRules>>) => TRefinement
): (state: Ref<InferInput<TRules>>) => Merge<TRules, TRefinement> {
  return (state) => merge({ ...rules }, refinement(state)) as any;
}
