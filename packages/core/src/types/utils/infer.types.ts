import type {
  RegleCollectionEachRules,
  RegleCollectionRuleDecl,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
} from '../rules';
import type { ExtractFromGetter, Prettify } from './misc.types';

export type InferInput<TRules extends ReglePartialRuleTree<Record<string, any>, any>> = Prettify<{
  [K in keyof TRules]: TRules[K] extends { $each: RegleCollectionEachRules<any, any> }
    ? ExtractFromGetter<TRules[K]['$each']> extends ReglePartialRuleTree<any, any>
      ? InferInput<ExtractFromGetter<TRules[K]['$each']>>[]
      : any[]
    : TRules[K] extends RegleRuleDecl<any, any>
      ? [ExtractTypeFromRules<TRules[K]>] extends [never]
        ? unknown
        : ExtractTypeFromRules<TRules[K]>
      : TRules[K] extends ReglePartialRuleTree<any, any>
        ? InferInput<TRules[K]>
        : string;
}>;

type FilterRulesWithInput<TRules extends RegleRuleDecl<any, any>> = {
  [K in keyof TRules as TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input>
    ? unknown extends Input
      ? never
      : K
    : never]: TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input> ? Input : unknown;
};

type ExtractTypeFromRules<TRules extends RegleRuleDecl<any, any>> =
  FilterRulesWithInput<TRules> extends { type: infer Input }
    ? Input
    : FilterRulesWithInput<TRules>[keyof FilterRulesWithInput<TRules>];
