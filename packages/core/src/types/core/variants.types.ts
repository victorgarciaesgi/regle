import type { IsUnion } from 'expect-type';
import type { UnionToTuple } from 'type-fest';
import type {
  AllRulesDeclarations,
  InferRegleStatusType,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../rules';
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

type PossibleLiteralTypes<T extends Record<string, any>, TKey extends keyof T> = {
  [TVal in NonNullable<T[TKey]>]: {
    [K in TKey]-?: Omit<RegleRuleDecl<TVal, Partial<AllRulesDeclarations>>, 'literal'> & {
      literal?: RegleRuleDefinition<TVal, [literal: TVal], false, boolean, string | number>;
    };
  };
};

type RequiredForm<T extends Record<string, any>, TKey extends keyof T> = Omit<ReglePartialRuleTree<T>, TKey> &
  PossibleLiteralTypes<T, TKey>[keyof PossibleLiteralTypes<T, TKey>];

export type VariantTuple<T extends Record<string, any>, TKey extends keyof T> = [
  RequiredForm<T, TKey>,
  ...RequiredForm<T, TKey>[],
];
