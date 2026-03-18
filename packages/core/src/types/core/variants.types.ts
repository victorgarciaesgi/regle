import type { EmptyObject, IsEmptyObject, IsUnion, Or, UnionToTuple } from 'type-fest';
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
  TIsUnionOverride extends boolean = false,
  /**
   * Workaround for $each variants, TS generic can't detect if the Rules are an union when type is too nested, to the tuple is passed from parent
   */
  TRulesTuple extends any[] = UnionToTuple<TRules>,
> =
  IsUnion<NonNullable<TState>> extends true
    ? Or<TIsUnionOverride, IsUnion<TRules>> extends true
      ? ProcessChildrenFields<NonNullable<TState>, TRulesTuple[number], TShortcuts> extends infer TChildren
        ? Omit<RegleStatus<NonNullable<TState>, TRulesTuple[number], TShortcuts>, '$fields'> & {
            $fields: TChildren[keyof TChildren];
          } & (HasNamedKeys<NonNullable<TState>> extends true ? TChildren[keyof TChildren] : {})
        : never
      : RegleStatus<
          JoinDiscriminatedUnions<NonNullable<TState>>,
          TRules extends ReglePartialRuleTree<NonNullable<JoinDiscriminatedUnions<NonNullable<TState>>>>
            ? TRules
            : EmptyObject,
          TShortcuts
        >
    : RegleStatus<TState, TRules, TShortcuts>;

/** Helper type to extract state tuple item at index */
type StateTupleItem<TStateTuple extends readonly any[], TIndexInt extends number> =
  TStateTuple[TIndexInt] extends Record<string, any> ? TStateTuple[TIndexInt] : never;

/** Helper type to extract NonNullable state tuple item */
type NonNullableStateTupleItem<TStateTuple extends readonly any[], TIndexInt extends number> = NonNullable<
  StateTupleItem<TStateTuple, TIndexInt>
>;

/** Helper type to find the corresponding variant rule */
type VariantRuleForKey<
  TStateTuple extends readonly any[],
  TRulesTuple extends readonly any[],
  TIndexInt extends number,
  TKey,
> =
  FindCorrespondingVariant<StateTupleItem<TStateTuple, TIndexInt>, TRulesTuple> extends [infer U]
    ? TKey extends keyof U
      ? U[TKey]
      : EmptyObject
    : EmptyObject;

type ProcessChildrenFields<
  TState extends Record<string, any> | undefined,
  TRules extends ReglePartialRuleTree<NonNullable<TState>>,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  UnionToTuple<TState> extends infer TStateTuple extends readonly any[]
    ? UnionToTuple<TRules> extends infer TRulesTuple extends readonly any[]
      ? {
          [TIndex in keyof TupleToPlainObj<TStateTuple>]: TIndex extends `${infer TIndexInt extends number}`
            ? {
                // Defined keys
                [TKey in keyof TStateTuple[TIndexInt] as IsEmptyObject<
                  VariantRuleForKey<TStateTuple, TRulesTuple, TIndexInt, TKey>
                > extends true
                  ? TKey extends keyof TState
                    ? TState[TKey] extends NonNullable<TState[TKey]>
                      ? TKey
                      : never
                    : never
                  : TKey]-?: InferRegleStatusType<
                  VariantRuleForKey<TStateTuple, TRulesTuple, TIndexInt, TKey>,
                  NonNullableStateTupleItem<TStateTuple, TIndexInt>,
                  TKey,
                  TShortcuts
                >;
              } & {
                // Maybe undefined keys
                [TKey in keyof TStateTuple[TIndexInt] as IsEmptyObject<
                  VariantRuleForKey<TStateTuple, TRulesTuple, TIndexInt, TKey>
                > extends true
                  ? TKey extends keyof TState
                    ? TState[TKey] extends NonNullable<TState[TKey]>
                      ? never
                      : TKey
                    : TKey
                  : never]?: InferRegleStatusType<
                  VariantRuleForKey<TStateTuple, TRulesTuple, TIndexInt, TKey>,
                  NonNullableStateTupleItem<TStateTuple, TIndexInt>,
                  TKey,
                  TShortcuts
                >;
              }
            : {};
        }
      : {}
    : {};

type FindCorrespondingVariant<TState extends Record<string, any>, TRules extends readonly any[]> = TRules extends [
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
