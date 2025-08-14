import type { MaybeRef, UnwrapRef } from 'vue';
import type { RegleCollectionEachRules, ReglePartialRuleTree, RegleRuleDecl, RegleRuleDefinition } from '../rules';
import type { ExtractFromGetter, MaybeInput, Prettify, UnwrapSimple } from './misc.types';
import type { IsUnion } from 'type-fest/source/internal';
import type { UnionToTuple } from 'type-fest';

export type InferInput<
  TRules extends
    | MaybeRef<ReglePartialRuleTree<Record<string, any>, any>>
    | ((state: any) => ReglePartialRuleTree<Record<string, any>, any>),
  TMarkMaybe extends boolean = true,
> =
  IsUnion<UnwrapSimple<TRules>> extends true
    ? InferTupleUnionInput<UnionToTuple<UnwrapSimple<TRules>>>[number]
    : TMarkMaybe extends true
      ? Prettify<{
          [K in keyof UnwrapSimple<TRules>]?: ProcessInputChildren<UnwrapSimple<TRules>[K], TMarkMaybe>;
        }>
      : Prettify<{
          [K in keyof UnwrapSimple<TRules>]: ProcessInputChildren<UnwrapSimple<TRules>[K], TMarkMaybe>;
        }>;

type ProcessInputChildren<TRule extends unknown, TMarkMaybe extends boolean> = TRule extends {
  $each: RegleCollectionEachRules<any, any>;
}
  ? ExtractFromGetter<TRule['$each']> extends ReglePartialRuleTree<any, any>
    ? InferInput<ExtractFromGetter<TRule['$each']>, TMarkMaybe>[]
    : any[]
  : TRule extends MaybeRef<RegleRuleDecl<any, any>>
    ? [ExtractTypeFromRules<UnwrapRef<TRule>>] extends [never]
      ? unknown
      : ExtractTypeFromRules<UnwrapRef<TRule>>
    : TRule extends ReglePartialRuleTree<any, any>
      ? InferInput<TRule, TMarkMaybe>
      : string;

type ExtractTypeFromRules<TRules extends RegleRuleDecl<any, any>> =
  FilterRulesWithInput<TRules> extends { type: infer Input }
    ? Input
    : [FilterRulesWithSingleType<TRules>[keyof FilterRulesWithSingleType<TRules>]] extends [never]
      ? FilterRulesWithInput<TRules>[keyof FilterRulesWithInput<TRules>]
      : FilterRulesWithSingleType<TRules>[keyof FilterRulesWithSingleType<TRules>];

type FilterRulesWithInput<TRules extends RegleRuleDecl<any, any>> = {
  [K in keyof TRules as TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input>
    ? unknown extends Input
      ? never
      : K
    : never]: TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input> ? Input : unknown;
};

type FilterRulesWithSingleType<TRules extends RegleRuleDecl<any, any>> = {
  [K in keyof TRules as TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input>
    ? unknown extends Input
      ? never
      : IsUnion<NonNullable<Input>> extends true
        ? never
        : K
    : never]: TRules[K] extends RegleRuleDefinition<any, any, any, any, infer Input>
    ? IsUnion<NonNullable<Input>> extends true
      ? unknown
      : Input
    : unknown;
};

type InferTupleUnionInput<T extends any[]> = T extends [infer F extends ReglePartialRuleTree, ...infer R]
  ? [InferInput<F, true>, ...InferTupleUnionInput<R>]
  : [];
