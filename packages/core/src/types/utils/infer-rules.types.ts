import type { IsAny, IsUnion, IsUnknown, UnionToTuple } from 'type-fest';
import type { MaybeRef, UnwrapRef } from 'vue';
import type { RegleCollectionEachRules, ReglePartialRuleTree, RegleRuleDecl, RegleRuleDefinition } from '../rules';
import type { ExtractFromGetter, isRecordLiteral, Prettify, Unwrap, UnwrapSimple } from './misc.types';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { DeepSafeFormState } from '../core';
import type { JoinDiscriminatedUnions } from './union.types';

/**
 * Infer safe output type from a rules object and it's original state type
 *
 * ```ts
 * type FormRequest = InferOutput<typeof rules, typeof formState>;
 * ```
 */
export type InferOutput<
  TRules extends
    | MaybeRef<ReglePartialRuleTree<Record<string, any>, any>>
    | ((state: any) => ReglePartialRuleTree<Record<string, any>, any>)
    | MaybeRef<StandardSchemaV1<any>>,
  TState extends MaybeRef<unknown> = InferInput<TRules>,
> =
  IsAny<TRules> extends true
    ? any
    : IsUnknown<TRules> extends true
      ? any
      : isRecordLiteral<TState> extends true
        ? TRules extends MaybeRef<StandardSchemaV1<infer State>>
          ? State
          : DeepSafeFormState<
              JoinDiscriminatedUnions<Unwrap<NonNullable<TState>>>,
              TRules extends MaybeRef<ReglePartialRuleTree<Record<string, any>, any>> ? UnwrapRef<TRules> : {}
            >
        : TState extends any[]
          ? TState[]
          : TState;

/**
 * Infer input type from a rules object
 *
 * ```ts
 * type FormRequest = InferInput<typeof rules>;
 * ```
 */
export type InferInput<
  TRules extends
    | MaybeRef<ReglePartialRuleTree<Record<string, any>, any>>
    | ((state: any) => ReglePartialRuleTree<Record<string, any>, any>)
    | MaybeRef<StandardSchemaV1<any>>,
  TMarkMaybe extends boolean = true,
> =
  IsAny<TRules> extends true
    ? any
    : IsUnknown<TRules> extends true
      ? any
      : TRules extends MaybeRef<StandardSchemaV1<infer State>>
        ? State
        : UnwrapSimple<TRules> extends infer TRulesUnwrapped extends Record<string, any>
          ? IsUnion<TRulesUnwrapped> extends true
            ? InferTupleUnionInput<UnionToTuple<TRulesUnwrapped>>[number]
            : TMarkMaybe extends true
              ? Prettify<
                  {
                    [K in keyof TRulesUnwrapped as [TRulesUnwrapped[K]] extends [MaybeRef<RegleRuleDecl<any, any>>]
                      ? K
                      : never]?: ProcessInputChildren<TRulesUnwrapped[K], TMarkMaybe>;
                  } & {
                    [K in keyof TRulesUnwrapped as [TRulesUnwrapped[K]] extends [MaybeRef<RegleRuleDecl<any, any>>]
                      ? never
                      : K]: ProcessInputChildren<TRulesUnwrapped[K], TMarkMaybe>;
                  }
                >
              : Prettify<{
                  [K in keyof TRulesUnwrapped]: ProcessInputChildren<TRulesUnwrapped[K], TMarkMaybe>;
                }>
          : never;

type ProcessInputChildren<TRule extends unknown, TMarkMaybe extends boolean> =
  IsAny<TRule> extends true
    ? any
    : IsUnknown<TRule> extends true
      ? any
      : TRule extends {
            $each: RegleCollectionEachRules<any, any>;
          }
        ? ExtractFromGetter<TRule['$each']> extends ReglePartialRuleTree<any, any>
          ? InferInput<ExtractFromGetter<TRule['$each']>, TMarkMaybe>[]
          : any[]
        : TRule extends MaybeRef<RegleRuleDecl<any, any>>
          ? ExtractTypeFromRules<UnwrapRef<TRule>> extends infer TRuleInput
            ? [TRuleInput] extends [never]
              ? unknown
              : TRuleInput
            : unknown
          : TRule extends ReglePartialRuleTree<any, any>
            ? InferInput<TRule, TMarkMaybe>
            : string;

type ExtractTypeFromRules<TRules extends RegleRuleDecl<any, any>> =
  FilterRulesWithInput<TRules> extends infer TFilteredWithInput extends Record<string, any>
    ? TFilteredWithInput extends { type: infer Input }
      ? Input
      : FilterRulesWithSingleType<TRules> extends infer TFilteredWithSingleType extends Record<string, any>
        ? [TFilteredWithSingleType[keyof TFilteredWithSingleType]] extends [never]
          ? TFilteredWithInput[keyof TFilteredWithInput]
          : TFilteredWithSingleType[keyof TFilteredWithSingleType]
        : never
    : never;

type RuleInput<TRule> = TRule extends RegleRuleDefinition<unknown, any, any, any, any, infer Input> ? Input : unknown;
type KnownRuleInput<TRule> = unknown extends RuleInput<TRule> ? never : RuleInput<TRule>;
type SingleKnownRuleInput<TRule> =
  IsUnion<NonNullable<KnownRuleInput<TRule>>> extends true ? never : KnownRuleInput<TRule>;

type FilterRulesWithInput<TRules extends RegleRuleDecl<any, any>> = {
  [K in keyof TRules as KnownRuleInput<TRules[K]> extends never ? never : K]: KnownRuleInput<TRules[K]>;
};

type FilterRulesWithSingleType<TRules extends RegleRuleDecl<any, any>> = {
  [K in keyof TRules as SingleKnownRuleInput<TRules[K]> extends never ? never : K]: SingleKnownRuleInput<TRules[K]>;
};

type InferTupleUnionInput<T extends any[]> = T extends [infer F extends ReglePartialRuleTree, ...infer R]
  ? [InferInput<F, true>, ...InferTupleUnionInput<R>]
  : [];
