import type { Merge, MergeExclusive } from 'type-fest';
import { merge } from '../../../shared';
import type { InferInput, ReglePartialRuleTree, RegleUnknownRulesTree } from '../types';
import type { Ref } from 'vue';

export function refine<
  TRules extends RegleUnknownRulesTree,
  TRefinement extends ReglePartialRuleTree<InferInput<TRules>> & RegleUnknownRulesTree,
>(rules: TRules, refinement: (state: Ref<InferInput<TRules>>) => TRefinement): TRules & TRefinement {
  return merge(rules, refinement) as any;
}
