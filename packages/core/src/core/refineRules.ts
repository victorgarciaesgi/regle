import type { Merge } from 'type-fest';
import { merge } from '../../../shared';
import type { InferInput, ReglePartialRuleTree, RegleUnknownRulesTree } from '../types';
import type { Ref } from 'vue';

export function defineRules<TRules extends RegleUnknownRulesTree>(rules: TRules): TRules {
  return rules;
}

export function refineRules<
  TRules extends RegleUnknownRulesTree,
  TRefinement extends ReglePartialRuleTree<InferInput<TRules>> & RegleUnknownRulesTree,
>(
  rules: TRules,
  refinement: (state: Ref<InferInput<TRules>>) => TRefinement
): (state: Ref<InferInput<TRules>>) => Merge<TRules, TRefinement> {
  return (state) => merge(rules, refinement(state)) as any;
}
