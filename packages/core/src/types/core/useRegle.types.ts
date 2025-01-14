import type { EmptyObject, UnionToIntersection } from 'type-fest';
import type { MaybeRef, Raw } from 'vue';
import type {
  CustomRulesDeclarationTree,
  RegleCollectionRuleDecl,
  RegleFormPropertyType,
  ReglePartialRuleTree,
  RegleRoot,
  RegleRuleDecl,
  RegleRuleDefinition,
} from '../rules';
import type { ArrayElement, ExtendOnlyRealRecord, ExtractFromGetter, Maybe, Prettify } from '../utils';
import type { RegleShortcutDefinition, RegleValidationGroupEntry } from './modifiers.types';

export interface Regle<
  TState extends Record<string, any> = EmptyObject,
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree> = EmptyObject,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = {},
  TShortcuts extends RegleShortcutDefinition = {},
> {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display informations.
   *
   * To see the list of properties: {@link https://www.reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<RegleRoot<TState, TRules, TValidationGroups, TShortcuts>>;
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
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree> | undefined,
> = [unknown] extends [TState]
  ? {}
  : TRules extends undefined
    ? TState
    : TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree>
      ? Prettify<
          {
            [K in keyof TState as IsPropertyOutputRequired<TState[K], TRules[K]> extends false
              ? K
              : never]?: SafeProperty<TState[K], TRules[K]>;
          } & {
            [K in keyof TState as IsPropertyOutputRequired<TState[K], TRules[K]> extends false
              ? never
              : K]-?: NonNullable<SafeProperty<TState[K], TRules[K]>>;
          }
        >
      : TState;

type FieldHaveRequiredRule<TRule extends RegleRuleDecl> = unknown extends TRule['required']
  ? false
  : TRule['required'] extends undefined
    ? false
    : TRule['required'] extends RegleRuleDefinition<any, infer Params, any, any, any>
      ? Params extends never[]
        ? true
        : false
      : false;

type ObjectHaveAtLeastOneRequiredField<
  TState extends Record<string, any>,
  TRule extends ReglePartialRuleTree<TState, any>,
> =
  TState extends Maybe<TState>
    ? {
        [K in keyof NonNullable<TState>]-?: IsPropertyOutputRequired<NonNullable<TState>[K], TRule[K]>;
      }[keyof TState] extends false
      ? false
      : true
    : true;

type ArrayHaveAtLeastOneRequiredField<TState extends Maybe<any[]>, TRule extends RegleCollectionRuleDecl<TState>> =
  TState extends Maybe<TState>
    ?
        | FieldHaveRequiredRule<Omit<TRule, '$each'> extends RegleRuleDecl ? Omit<TRule, '$each'> : {}>
        | ObjectHaveAtLeastOneRequiredField<
            ArrayElement<NonNullable<TState>>,
            ExtractFromGetter<TRule['$each']> extends undefined ? {} : NonNullable<ExtractFromGetter<TRule['$each']>>
          > extends false
      ? false
      : true
    : true;

export type SafeProperty<TState, TRule extends RegleFormPropertyType<any, any> | undefined> = [unknown] extends [TState]
  ? unknown
  : TRule extends RegleCollectionRuleDecl<any, any>
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
  : NonNullable<TState> extends Array<any>
    ? TRule extends RegleCollectionRuleDecl<any, any>
      ? ArrayHaveAtLeastOneRequiredField<NonNullable<TState>, TRule> extends false
        ? false
        : true
      : false
    : TRule extends ReglePartialRuleTree<any, any>
      ? ExtendOnlyRealRecord<TState> extends true
        ? ObjectHaveAtLeastOneRequiredField<
            NonNullable<TState> extends Record<string, any> ? NonNullable<TState> : {},
            TRule
          > extends false
          ? false
          : true
        : TRule extends RegleRuleDecl<any, any>
          ? FieldHaveRequiredRule<TRule> extends false
            ? false
            : true
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
