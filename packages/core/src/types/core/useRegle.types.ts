import type { EmptyObject, UnionToIntersection } from 'type-fest';
import type { MaybeRef } from 'vue';
import type { DefaultValidators } from '../../core';
import type { useRegleFn } from '../../core/useRegle';
import type {
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleExternalErrorTree,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRoot,
  RegleRuleDecl,
  RegleRuleDefinition,
  UnwrapRuleTree,
} from '../rules';
import type { ExtractFromGetter } from '../utils';
import type { RegleShortcutDefinition, RegleValidationGroupEntry } from './options.types';

export interface Regle<
  TState extends Record<string, any> = EmptyObject,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree> = EmptyObject,
  TExternal extends RegleExternalErrorTree<TState> = never,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
  TShortcuts extends RegleShortcutDefinition = never,
> {
  r$: RegleRoot<TState, TRules, TValidationGroups, TExternal, TShortcuts>;
}

export type isDeepExact<T, U> = {
  [K in keyof T]-?: CheckDeepExact<
    NonNullable<T[K]>,
    K extends keyof U ? NonNullable<U[K]> : never
  >;
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
        : T extends ReglePartialValidationTree<any>
          ? isDeepExact<T, U>
          : false
    : T extends RegleRuleDecl
      ? true
      : T extends ReglePartialValidationTree<any>
        ? isDeepExact<T, U>
        : false;

export type DeepReactiveState<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type DeepSafeFormState<
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree>,
> = [unknown] extends [TState]
  ? {}
  : {
      [K in keyof TState as [SafeProperty<TState[K], TRules[K]>] extends [never] ? K : never]?: [
        SafeProperty<TState[K], TRules[K]>,
      ] extends [never]
        ? TState[K]
        : SafeProperty<TState[K], TRules[K]>;
    } & {
      [K in keyof TState as [SafeProperty<TState[K], TRules[K]>] extends [never]
        ? never
        : K]-?: SafeProperty<TState[K], TRules[K]>;
    };

export type SafeProperty<
  TState,
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> =
  TRule extends RegleCollectionRuleDefinition<any, any>
    ? TState extends Array<any>
      ? SafeProperty<TState[number], ExtractFromGetter<TRule['$each']>>[]
      : never
    : TRule extends ReglePartialValidationTree<any, any>
      ? TState extends Record<string, any>
        ? DeepSafeFormState<TState, TRule>
        : TRule extends RegleRuleDecl<any, any>
          ? unknown extends TRule['required']
            ? never
            : TRule['required'] extends undefined
              ? never
              : TRule['required'] extends RegleRuleDefinition<any, infer Params, any, any, any>
                ? Params extends never[]
                  ? TState
                  : never
                : never
          : never
      : never;
