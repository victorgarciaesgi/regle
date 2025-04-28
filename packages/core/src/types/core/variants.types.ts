import type { IsUnion } from 'expect-type';
import type { EmptyObject, IsEmptyObject, UnionToTuple } from 'type-fest';
import type {
  AllRulesDeclarations,
  InferRegleStatusType,
  RegleCollectionStatus,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../rules';
import type { LazyJoinDiscriminatedUnions, MaybeInput, TupleToPlainObj } from '../utils';
import type { RegleShortcutDefinition } from './modifiers.types';

export type NarrowVariant<
  TRoot extends {
    [x: string]: unknown;
  },
  TKey extends keyof TRoot,
  TValue extends LazyJoinDiscriminatedUnions<
    Exclude<TRoot[TKey], RegleCollectionStatus<any, any, any> | RegleStatus<any, any, any>>
  > extends { $value: infer V }
    ? V
    : unknown,
> = Extract<TRoot, { [K in TKey]: RegleFieldStatus<TValue, any, any> }>;

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
        // Defined keys
        [TKey in keyof UnionToTuple<TState>[TIndexInt] as IsEmptyObject<
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
            ? TState[TKey] extends NonNullable<TState[TKey]>
              ? TKey
              : never
            : never
          : TKey]-?: InferRegleStatusType<
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
        >;
      } & {
        // Maybe undefined keys
        [TKey in keyof UnionToTuple<TState>[TIndexInt] as IsEmptyObject<
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
            ? TState[TKey] extends NonNullable<TState[TKey]>
              ? never
              : TKey
            : TKey
          : never]?: InferRegleStatusType<
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
        >;
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

type PossibleLiteralTypes<T extends Record<string, any>, TKey extends keyof T> = unknown extends T[TKey]
  ? {
      [x: string]: {
        [K in TKey]-?: Omit<RegleRuleDecl<any, Partial<AllRulesDeclarations>>, 'literal'> & {
          literal?: RegleRuleDefinition<any, [literal: any], false, boolean, any, string | number>;
        };
      };
    }
  : {
      [TVal in NonNullable<T[TKey]>]: {
        [K in TKey]-?: Omit<RegleRuleDecl<TVal, Partial<AllRulesDeclarations>>, 'literal'> & {
          literal?: RegleRuleDefinition<
            MaybeInput<TVal>,
            [literal: TVal],
            false,
            boolean,
            MaybeInput<TVal>,
            string | number
          >;
        };
      };
    };

type RequiredForm<T extends Record<string, any>, TKey extends keyof T> = Omit<ReglePartialRuleTree<T>, TKey> &
  PossibleLiteralTypes<T, TKey>[keyof PossibleLiteralTypes<T, TKey>];

export type VariantTuple<T extends Record<string, any>, TKey extends keyof T> = [
  RequiredForm<T, TKey>,
  ...RequiredForm<T, TKey>[],
];
