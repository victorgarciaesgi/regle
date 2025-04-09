import type { IsUnion } from 'expect-type';
import type { EmptyObject, IsEmptyObject, UnionToTuple } from 'type-fest';
import type {
  AllRulesDeclarations,
  InferRegleStatusType,
  RegleCollectionRuleDecl,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
} from '../rules';
import type { JoinDiscriminatedUnions, TupleToPlainObj } from '../utils';
import type { RegleShortcutDefinition } from './modifiers.types';

type rules = {
  nested:
    | {
        type: {
          literal: RegleRuleDefinition<'TWO', [literal: 'TWO'], false, boolean, string | number>;
        };
        lastName: {
          required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
        };
      }
    | {
        type: {
          literal: RegleRuleDefinition<'ONE', [literal: 'ONE'], false, boolean, string | number>;
        };
        firstName: {
          required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
        };
      }
    | {
        type: {
          required: RegleRuleDefinition<unknown, [], false, boolean, unknown>;
        };
      };
};

type test = MaybeVariantStatus<
  {
    nested: { name: string } & (
      | { type: 'TWO'; firstName: number; lastName: string }
      | { type: 'ONE'; details: { quotes: { name: string }[] }; firstName: string }
      | { type?: undefined }
    );
  },
  rules
>['$fields']['nested']['$fields'];

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
        [TKey in keyof UnionToTuple<TState>[TIndexInt]]: InferRegleStatusType<
          TKey extends keyof UnionToTuple<TRules>[TIndexInt]
            ? UnionToTuple<TRules>[TIndexInt][TKey] extends
                | RegleCollectionRuleDecl
                | RegleRuleDecl
                | ReglePartialRuleTree<any>
              ? UnionToTuple<TRules>[TIndexInt][TKey]
              : EmptyObject
            : EmptyObject,
          NonNullable<UnionToTuple<TState>[TIndexInt]>,
          TKey,
          TShortcuts
        >;
      }
    : {};
};

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
