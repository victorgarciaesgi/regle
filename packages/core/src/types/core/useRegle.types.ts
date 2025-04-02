import type { EmptyObject, UnionToIntersection } from 'type-fest';
import type { MaybeRef, Raw } from 'vue';
import type {
  CustomRulesDeclarationTree,
  RegleCollectionRuleDecl,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleRoot,
  RegleRuleDecl,
} from '../rules';
import type { Maybe, PrimitiveTypes } from '../utils';
import type { RegleShortcutDefinition, RegleValidationGroupEntry } from './modifiers.types';

export type Regle<
  TState extends Record<string, any> = EmptyObject,
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree> = EmptyObject,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = {},
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display informations.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<RegleRoot<TState, TRules, TValidationGroups, TShortcuts>>;
} & TAdditionalReturnProperties;

export type RegleSingleField<
  TState extends Maybe<PrimitiveTypes> = any,
  TRules extends RegleRuleDecl<NonNullable<TState>> = EmptyObject,
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display informations.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<RegleFieldStatus<TState, TRules, TShortcuts>>;
} & TAdditionalReturnProperties;

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

export type DeepExtend<T extends ReglePartialRuleTree<any>> = {
  [K in keyof T]?: CheckDeepField<NonNullable<T[K]>>;
};

type CheckDeepField<T> = T extends RegleCollectionRuleDecl
  ? DeepExtend<NonNullable<T['$each']>>
  : T extends RegleRuleDecl
    ? T
    : T extends ReglePartialRuleTree<any>
      ? DeepExtend<T>
      : never;

export type DeepReactiveState<T extends Record<string, any> | unknown | undefined> =
  ExtendOnlyRealRecord<T> extends true
    ? {
        [K in keyof T]: InferDeepReactiveState<T[K]>;
      }
    : never;

export type InferDeepReactiveState<TState> =
  NonNullable<TState> extends Array<infer U extends Record<string, any>>
    ? DeepReactiveState<U[]>
    : NonNullable<TState> extends Date | File
      ? MaybeRef<TState>
      : TState extends Record<string, any> | undefined
        ? DeepReactiveState<TState>
        : MaybeRef<TState>;
