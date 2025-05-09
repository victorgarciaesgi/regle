import type { Merge } from 'type-fest';
import { merge } from '../../../shared';
import type { InferInput, ReglePartialRuleTree, RegleUnknownRulesTree } from '../types';
import type { Ref } from 'vue';

/**
 * Helper method to wrap an raw rules object
 *
 * Similar to:
 *
 * ```ts
 * const rules = {...} satisfies RegleUnknownRulesTree
 * ```
 */
export function defineRules<TRules extends RegleUnknownRulesTree>(rules: TRules): TRules {
  return rules;
}

/**
 * Refine a raw rules object to set rules that depends on the state values.
 *
 * @example
 *
 * ```ts
 * const rules = refineRules({
 *    password: { required, type: type<string>() },
 * }, (state) => {
 *    return {
 *        confirmPassword: { required, sameAs: sameAs(() => state.value.password)}
 *    }
 * })
 * ```
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
