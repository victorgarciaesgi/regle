import type { UnionToTuple } from 'type-fest';
import type { InferRegleStatusType, ReglePartialRuleTree, RegleStatus } from '../rules';
import type { RegleShortcutDefinition } from './modifiers.types';
import type { JoinDiscriminatedUnions, TupleToPlainObj } from '../utils';
import type { IsUnion } from 'expect-type';

export type MaybeVariantStatus<
  TState extends Record<string, any> | undefined = Record<string, any>,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  IsUnion<TRules> extends true
    ? Omit<RegleStatus<TState, TRules, TShortcuts>, '$fields'> & {
        $fields: {
          [TIndex in keyof TupleToPlainObj<UnionToTuple<TRules>>]: TIndex extends `${infer TIndexInt extends number}`
            ? {
                readonly [TKey in keyof UnionToTuple<TState>[TIndexInt]]: InferRegleStatusType<
                  NonNullable<
                    TKey extends keyof JoinDiscriminatedUnions<TRules> ? JoinDiscriminatedUnions<TRules>[TKey] : never
                  >,
                  NonNullable<UnionToTuple<TState>[TIndexInt]>,
                  TKey,
                  TShortcuts
                >;
              }
            : {};
        }[keyof TupleToPlainObj<UnionToTuple<TRules>>];
      }
    : RegleStatus<TState, TRules, TShortcuts>;
