import type { IsUnion } from 'expect-type';
import type { UnionToTuple } from 'type-fest';
import type { InferRegleStatusType, ReglePartialRuleTree, RegleStatus } from '../rules';
import type { JoinDiscriminatedUnions, TupleToPlainObj } from '../utils';
import type { RegleShortcutDefinition } from './modifiers.types';

export type MaybeVariantStatus<
  TState extends Record<string, any> | undefined = Record<string, any>,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  IsUnion<NonNullable<TState>> extends true
    ? Omit<RegleStatus<TState, TRules, TShortcuts>, '$fields'> & {
        $fields: {
          [TIndex in keyof TupleToPlainObj<UnionToTuple<TState>>]: TIndex extends `${infer TIndexInt extends number}`
            ? {
                [TKey in keyof UnionToTuple<TState>[TIndexInt] as TKey extends keyof JoinDiscriminatedUnions<TRules>
                  ? TKey
                  : never]-?: InferRegleStatusType<
                  NonNullable<
                    TKey extends keyof JoinDiscriminatedUnions<TRules> ? JoinDiscriminatedUnions<TRules>[TKey] : {}
                  >,
                  NonNullable<UnionToTuple<TState>[TIndexInt]>,
                  TKey,
                  TShortcuts
                >;
              } & {
                [TKey in keyof UnionToTuple<TState>[TIndexInt] as TKey extends keyof JoinDiscriminatedUnions<TRules>
                  ? never
                  : TKey]: InferRegleStatusType<{}, NonNullable<UnionToTuple<TState>[TIndexInt]>, TKey, TShortcuts>;
              }
            : {};
        }[keyof TupleToPlainObj<UnionToTuple<TState>>];
      }
    : RegleStatus<TState, TRules, TShortcuts>;
