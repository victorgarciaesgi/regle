import type { MaybeRef } from 'vue';
import type { RegleCollectionEachRules, ReglePartialRuleTree, RegleRuleDecl, RegleRuleDefinition } from '../rules';
import type { ExtractFromGetter, Prettify, UnwrapSimple } from './misc.types';

export type InferInput<TRules extends MaybeRef<ReglePartialRuleTree<Record<string, any>, any>>> = Prettify<{
  [K in keyof UnwrapSimple<TRules>]: UnwrapSimple<TRules>[K] extends { $each: RegleCollectionEachRules<any, any> }
    ? ExtractFromGetter<UnwrapSimple<TRules>[K]['$each']> extends ReglePartialRuleTree<any, any>
      ? InferInput<ExtractFromGetter<UnwrapSimple<TRules>[K]['$each']>>[]
      : any[]
    : UnwrapSimple<TRules>[K] extends RegleRuleDecl<any, any>
      ? [ExtractTypeFromRules<UnwrapSimple<TRules>[K]>] extends [never]
        ? unknown
        : ExtractTypeFromRules<UnwrapSimple<TRules>[K]>
      : UnwrapSimple<TRules>[K] extends ReglePartialRuleTree<any, any>
        ? InferInput<UnwrapSimple<TRules>[K]>
        : string;
}>;

type ExtractTypeFromRules<TRules extends RegleRuleDecl<any, any>> =
  FilterRulesWithInput<TRules> extends { type: infer Input }
    ? Input
    : FilterRulesWithInput<TRules>[keyof FilterRulesWithInput<TRules>];

type FilterRulesWithInput<TRules extends RegleRuleDecl<any, any>> = {
  [K in keyof TRules as TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input>
    ? unknown extends Input
      ? never
      : K
    : never]: TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input> ? Input : unknown;
};
