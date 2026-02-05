import type { EmptyObject, IsEmptyObject, IsUnion, UnionToTuple } from 'type-fest';
import type {
  ExtendedRulesDeclarations,
  InferRegleStatusType,
  RegleCollectionStatus,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../rules';
import type {
  HasNamedKeys,
  JoinDiscriminatedUnions,
  LazyJoinDiscriminatedUnions,
  MaybeInput,
  TupleToPlainObj,
} from '../utils';
import type { RegleShortcutDefinition } from './modifiers.types';

/** Types to be augmented by @regle/schemas */
export interface NarrowVariantExtracts {}
/* oxlint-disable eslint(no-unused-vars) */
export interface NarrowVariantFieldExtracts<T extends unknown> {}

export type NarrowVariant<
  TRoot extends {
    [x: string]: unknown;
    $fields: {
      [x: string]: unknown;
    };
    $value: unknown;
  },
  TKey extends keyof TRoot,
  TValue extends LazyJoinDiscriminatedUnions<
    Exclude<
      TRoot[TKey],
      | RegleCollectionStatus<any, any, any>
      | RegleStatus<any, any, any>
      | NarrowVariantExtracts[keyof NarrowVariantExtracts]
    >
  > extends { $value: infer V }
    ? V
    : unknown,
> = Extract<
  TRoot,
  {
    [K in TKey]:
      | RegleFieldStatus<TValue, any, any>
      | RegleFieldStatus<MaybeInput<TValue>, any, any>
      | (IsEmptyObject<NarrowVariantFieldExtracts<TValue>> extends true
          ? EmptyObject
          : NarrowVariantFieldExtracts<TValue>[keyof NarrowVariantFieldExtracts<TValue>]);
  }
> & {
  $fields: Extract<
    TRoot['$fields'],
    {
      [K in TKey]:
        | RegleFieldStatus<TValue, any, any>
        | RegleFieldStatus<MaybeInput<TValue>, any, any>
        | (IsEmptyObject<NarrowVariantFieldExtracts<TValue>> extends true
            ? EmptyObject
            : NarrowVariantFieldExtracts<TValue>[keyof NarrowVariantFieldExtracts<TValue>]);
    }
  > & {
    [K in TKey]: TRoot[K] & { $value: TValue };
  };
} & {
  $value: Omit<TRoot['$value'], TKey> & { [K in TKey]: TValue };
} & {
  [K in TKey]: TRoot[K] & { $value: TValue };
};

export type MaybeVariantStatus<
  TState extends Record<string, any> | undefined = Record<string, any>,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  IsUnion<NonNullable<TState>> extends true
    ? IsUnion<TRules> extends true
      ? Omit<RegleStatus<TState, TRules, TShortcuts>, '$fields'> & {
          $fields: ProcessChildrenFields<TState, TRules, TShortcuts>[keyof ProcessChildrenFields<
            TState,
            TRules,
            TShortcuts
          >];
        } & (HasNamedKeys<TState> extends true
            ? ProcessChildrenFields<TState, TRules, TShortcuts>[keyof ProcessChildrenFields<TState, TRules, TShortcuts>]
            : {})
      : RegleStatus<
          JoinDiscriminatedUnions<TState>,
          TRules extends ReglePartialRuleTree<NonNullable<JoinDiscriminatedUnions<TState>>> ? TRules : EmptyObject,
          TShortcuts
        >
    : RegleStatus<TState, TRules, TShortcuts>;

/** Helper type to extract state tuple item at index */
type StateTupleItem<TState, TIndexInt extends number> =
  UnionToTuple<TState>[TIndexInt] extends Record<string, any> ? UnionToTuple<TState>[TIndexInt] : never;

/** Helper type to extract NonNullable state tuple item */
type NonNullableStateTupleItem<TState, TIndexInt extends number> = NonNullable<StateTupleItem<TState, TIndexInt>>;

/** Helper type to find the corresponding variant rule */
type VariantRuleForKey<TState, TRules, TIndexInt extends number, TKey> =
  FindCorrespondingVariant<StateTupleItem<TState, TIndexInt>, UnionToTuple<TRules>> extends [infer U]
    ? TKey extends keyof U
      ? U[TKey]
      : EmptyObject
    : EmptyObject;

type ProcessChildrenFields<
  TState extends Record<string, any> | undefined,
  TRules extends ReglePartialRuleTree<NonNullable<TState>>,
  TShortcuts extends RegleShortcutDefinition = {},
> = {
  [TIndex in keyof TupleToPlainObj<UnionToTuple<TState>>]: TIndex extends `${infer TIndexInt extends number}`
    ? {
        // Defined keys
        [TKey in keyof UnionToTuple<TState>[TIndexInt] as IsEmptyObject<
          VariantRuleForKey<TState, TRules, TIndexInt, TKey>
        > extends true
          ? TKey extends keyof TState
            ? TState[TKey] extends NonNullable<TState[TKey]>
              ? TKey
              : never
            : never
          : TKey]-?: InferRegleStatusType<
          VariantRuleForKey<TState, TRules, TIndexInt, TKey>,
          NonNullableStateTupleItem<TState, TIndexInt>,
          TKey,
          TShortcuts
        >;
      } & {
        // Maybe undefined keys
        [TKey in keyof UnionToTuple<TState>[TIndexInt] as IsEmptyObject<
          VariantRuleForKey<TState, TRules, TIndexInt, TKey>
        > extends true
          ? TKey extends keyof TState
            ? TState[TKey] extends NonNullable<TState[TKey]>
              ? never
              : TKey
            : TKey
          : never]?: InferRegleStatusType<
          VariantRuleForKey<TState, TRules, TIndexInt, TKey>,
          NonNullableStateTupleItem<TState, TIndexInt>,
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
        [K in TKey]-?: Omit<RegleRuleDecl<any, Partial<ExtendedRulesDeclarations>>, 'literal'> & {
          literal?: RegleRuleDefinition<'literal', any, [literal: any], false, boolean, any, string | number, true>;
        };
      };
    }
  : {
      [TVal in NonNullable<T[TKey]>]: {
        [K in TKey]-?: Omit<RegleRuleDecl<TVal, Partial<ExtendedRulesDeclarations>>, 'literal'> & {
          literal?: RegleRuleDefinition<
            'literal',
            MaybeInput<TVal>,
            [literal: TVal],
            false,
            boolean,
            MaybeInput<TVal>,
            string | number,
            true
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
