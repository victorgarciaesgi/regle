import type { EmptyObject, UnionToIntersection } from 'type-fest';
import type { ComputedRef, MaybeRef, Ref } from 'vue';
import type {
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleErrorTree,
  RegleExternalErrorTree,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleStatus,
  UnwrapRuleTree,
} from '../rules';
import type { ExtractFromGetter, Prettify } from '../utils';
import type { RegleValidationGroupEntry } from './options.types';
import type { useRegleFn } from '../../core/useRegle';
import type { DefaultValidators } from '../../core';

export interface Regle<
  TState extends Record<string, any> = EmptyObject,
  TRules extends ReglePartialValidationTree<TState, CustomRulesDeclarationTree> = EmptyObject,
  TExternal extends RegleExternalErrorTree<TState> = never,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
> {
  r$: RegleStatus<TState, TRules, TValidationGroups, TExternal>;
  ready: ComputedRef<boolean>;
  resetAll: () => void;
  validateState: () => Promise<false | Prettify<DeepSafeFormState<TState, TRules>>>;
  state: Ref<TState>;
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

export type InferRegleRules<T extends useRegleFn<any>> =
  T extends useRegleFn<infer U> ? UnwrapRuleTree<Partial<U> & Partial<DefaultValidators>> : {};

export type RegleRequiredRules<
  T extends Partial<AllRulesDeclarations> | useRegleFn<any>,
  TRules extends T extends useRegleFn<any> ? keyof InferRegleRules<T> : keyof T,
> = Omit<
  T extends useRegleFn<any>
    ? InferRegleRules<T>
    : T extends Partial<AllRulesDeclarations>
      ? UnwrapRuleTree<T>
      : {},
  TRules
> & {
  [K in TRules]-?: T extends useRegleFn<any>
    ? K extends keyof InferRegleRules<T>
      ? NonNullable<InferRegleRules<T>[K]>
      : never
    : K extends keyof T
      ? NonNullable<T[K]>
      : never;
};
