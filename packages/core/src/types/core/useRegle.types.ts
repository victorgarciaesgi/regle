import type { EmptyObject, UnionToIntersection } from 'type-fest';
import type { MaybeRef } from 'vue';
import type {
  CustomRulesDeclarationTree,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleFormPropertyType,
  ReglePartialRuleTree,
  RegleRoot,
  RegleRuleDecl,
  RegleRuleDefinition,
} from '../rules';
import type { ExtendOnlyRealRecord, ExtractFromGetter, Maybe, Prettify } from '../utils';
import type { RegleShortcutDefinition, RegleValidationGroupEntry } from './options.types';

export interface Regle<
  TState extends Record<string, any> = EmptyObject,
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree> = EmptyObject,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = {},
  TShortcuts extends RegleShortcutDefinition = {},
> {
  r$: RegleRoot<TState, TRules, TValidationGroups, TShortcuts>;
}

export type isDeepExact<T, U> = {
  [K in keyof T]-?: CheckDeepExact<NonNullable<T[K]>, K extends keyof U ? NonNullable<U[K]> : never>;
}[keyof T] extends true
  ? true
  : false;

type CheckDeepExact<T, U> = [U] extends [never]
  ? false
  : T extends RegleCollectionRuleDecl
    ? U extends RegleCollectionRuleDecl
      ? isDeepExact<NonNullable<T['$each']>, UnionToIntersection<NonNullable<U['$each']>>>
      : T extends RegleRuleDecl
        ? true
        : T extends ReglePartialRuleTree<any>
          ? isDeepExact<T, U>
          : false
    : T extends RegleRuleDecl
      ? true
      : T extends ReglePartialRuleTree<any>
        ? isDeepExact<T, U>
        : false;

export type DeepReactiveState<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type DeepSafeFormState<
  TState extends Record<string, any>,
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree>,
> = [unknown] extends [TState]
  ? {}
  : Prettify<
      {
        [K in keyof TState as IsPropertyOutputRequired<TState[K], TRules[K]> extends false ? K : never]?: SafeProperty<
          TState[K],
          TRules[K]
        >;
      } & {
        [K in keyof TState as IsPropertyOutputRequired<TState[K], TRules[K]> extends false ? never : K]-?: NonNullable<
          SafeProperty<TState[K], TRules[K]>
        >;
      }
    >;

type FieldHaveRequiredRule<TRule extends RegleRuleDecl> = unknown extends TRule['required']
  ? false
  : TRule['required'] extends undefined
    ? false
    : TRule['required'] extends RegleRuleDefinition<any, infer Params, any, any, any>
      ? Params extends never[]
        ? true
        : false
      : false;

type ObjectHaveAtLeastOneRequiredField<TState, TRule extends ReglePartialRuleTree<any, any>> =
  TState extends Maybe<TState>
    ? {
        [K in keyof TRule]: TRule[K] extends RegleRuleDecl ? FieldHaveRequiredRule<TRule[K]> : false;
      }[keyof TRule]
    : true;

type ArrayHaveAtLeastOneRequiredField<TState, TRule extends RegleCollectionRuleDefinition<any, any>> =
  TState extends Maybe<TState>
    ? {
        [K in keyof ExtractFromGetter<TRule['$each']>]: ExtractFromGetter<TRule['$each']>[K] extends RegleRuleDecl
          ? FieldHaveRequiredRule<ExtractFromGetter<TRule['$each']>[K]>
          : false;
      }[keyof ExtractFromGetter<TRule['$each']>]
    : true;

export type SafeProperty<TState, TRule extends RegleFormPropertyType<any, any> | undefined> = [unknown] extends [TState]
  ? unknown
  : TRule extends RegleCollectionRuleDefinition<any, any>
    ? TState extends Array<infer U extends Record<string, any>>
      ? DeepSafeFormState<U, ExtractFromGetter<TRule['$each']>>[]
      : TState
    : TRule extends ReglePartialRuleTree<any, any>
      ? ExtendOnlyRealRecord<TState> extends true
        ? DeepSafeFormState<NonNullable<TState> extends Record<string, any> ? NonNullable<TState> : {}, TRule>
        : TRule extends RegleRuleDecl<any, any>
          ? FieldHaveRequiredRule<TRule> extends true
            ? TState
            : Maybe<TState>
          : TState
      : TState;

export type IsPropertyOutputRequired<TState, TRule extends RegleFormPropertyType<any, any> | undefined> = [
  unknown,
] extends [TState]
  ? unknown
  : TRule extends RegleCollectionRuleDefinition<any, any>
    ? TState extends Array<any>
      ? ArrayHaveAtLeastOneRequiredField<TState, TRule> extends true
        ? true
        : false
      : false
    : TRule extends ReglePartialRuleTree<any, any>
      ? ExtendOnlyRealRecord<TState> extends true
        ? ObjectHaveAtLeastOneRequiredField<TState, TRule> extends true
          ? true
          : false
        : TRule extends RegleRuleDecl<any, any>
          ? FieldHaveRequiredRule<TRule> extends true
            ? true
            : false
          : false
      : false;

export type SafeFieldProperty<TState, TRule extends RegleFormPropertyType<any, any> | undefined = never> =
  TRule extends RegleRuleDecl<any, any>
    ? unknown extends TRule['required']
      ? Maybe<TState>
      : TRule['required'] extends undefined
        ? never
        : TRule['required'] extends RegleRuleDefinition<any, infer Params, any, any, any>
          ? Params extends never[]
            ? Maybe<TState>
            : Maybe<TState>
          : Maybe<TState>
    : Maybe<TState>;
