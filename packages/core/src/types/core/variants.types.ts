import type { IsUnion } from 'expect-type';
import type { EmptyObject, IsEmptyObject, UnionToTuple } from 'type-fest';
import type {
  AllRulesDeclarations,
  InferRegleStatusType,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../rules';
import type { TupleToPlainObj } from '../utils';
import type { RegleShortcutDefinition } from './modifiers.types';

export type MaybeVariantStatus<
  TState extends Record<string, any> | undefined = Record<string, any>,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  IsUnion<NonNullable<TState>> extends true
    ? Omit<RegleStatus<TState, TRules, TShortcuts>, '$fields'> & {
        $fields: ProcessChildrenFields<TState, TRules, TShortcuts>[keyof ProcessChildrenFields<
          TState,
          TRules,
          TShortcuts
        >];
      }
    : RegleStatus<TState, TRules, TShortcuts>;

type ProcessChildrenFields<
  TState extends Record<string, any> | undefined,
  TRules extends ReglePartialRuleTree<NonNullable<TState>>,
  TShortcuts extends RegleShortcutDefinition = {},
> = {
  [TIndex in keyof TupleToPlainObj<UnionToTuple<TState>>]: TIndex extends `${infer TIndexInt extends number}`
    ? {
        [TKey in keyof UnionToTuple<TState>[TIndexInt]]:
          | InferRegleStatusType<
              FindCorrespondingVariant<
                UnionToTuple<TState>[TIndexInt] extends Record<string, any> ? UnionToTuple<TState>[TIndexInt] : never,
                UnionToTuple<TRules>
              > extends [infer U]
                ? TKey extends keyof U
                  ? U[TKey]
                  : EmptyObject
                : EmptyObject,
              NonNullable<UnionToTuple<TState>[TIndexInt]>,
              TKey,
              TShortcuts
            >
          | (IsEmptyObject<
              FindCorrespondingVariant<
                UnionToTuple<TState>[TIndexInt] extends Record<string, any> ? UnionToTuple<TState>[TIndexInt] : never,
                UnionToTuple<TRules>
              > extends [infer U]
                ? TKey extends keyof U
                  ? U[TKey]
                  : EmptyObject
                : EmptyObject
            > extends true
              ? TKey extends keyof TState
                ? NonNullable<TState[TKey]> extends TState[TKey]
                  ? never
                  : undefined
                : undefined
              : never);
      }
    : {};
};

type FindCorrespondingVariant<TState extends Record<string, any>, TRules extends any[]> = TRules extends [
  infer F,
  ...infer R,
]
  ? F extends ReglePartialRuleTree<TState>
    ? [F]
    : FindCorrespondingVariant<TState, R>
  : [];

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
