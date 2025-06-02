import type { DefaultValidators } from '../../core';
import type { useRegleFn } from '../../core/useRegle';
import type {
  AllRulesDeclarations,
  DefaultValidatorsTree,
  RegleCollectionStatus,
  RegleFieldStatus,
  RegleFormPropertyType,
  ReglePartialRuleTree,
  RegleStatus,
  SuperCompatibleRegle,
  UnwrapRuleTree,
  UnwrapRuleWithParams,
} from '../rules';
import type { ArrayElement } from './Array.types';

/**
 * Infer type of the `r$` of any function returning a regle instance
 */
export type InferRegleRoot<T extends (...args: any[]) => SuperCompatibleRegle> = T extends (...args: any[]) => infer U
  ? U extends SuperCompatibleRegle
    ? U['r$']
    : never
  : never;

/**
 * Infer custom rules declared in a global configuration
 */
export type InferRegleRules<T extends useRegleFn<any, any>> =
  T extends useRegleFn<infer U, any> ? UnwrapRuleTree<Partial<U> & Partial<DefaultValidators>> : {};

/**
 * Infer custom shortcuts declared in a global configuration
 */
export type InferRegleShortcuts<T extends useRegleFn<any, any>> = T extends useRegleFn<any, infer U> ? U : {};

/**
 * Extract a set rules and setting them as required
 */
export type RegleEnforceRequiredRules<TRules extends keyof DefaultValidators> = Omit<
  Partial<DefaultValidatorsTree>,
  TRules
> & {
  [K in TRules]-?: UnwrapRuleWithParams<DefaultValidators[K]>;
};

/**
 * Extract a set of custom rules from a global configuration and setting them as required

 */
export type RegleEnforceCustomRequiredRules<
  T extends Partial<AllRulesDeclarations> | useRegleFn<any, any>,
  TRules extends T extends useRegleFn<any, any> ? keyof InferRegleRules<T> : keyof T,
> = Omit<Partial<DefaultValidatorsTree>, TRules> & {
  [K in TRules]-?: T extends useRegleFn<any, any>
    ? K extends keyof InferRegleRules<T>
      ? NonNullable<UnwrapRuleWithParams<InferRegleRules<T>[K]>>
      : never
    : K extends keyof T
      ? NonNullable<T[K]>
      : never;
};

// ----- Custom Status

/**
 * Extract custom rules and custom shortcuts and apply them to a RegleFieldStatus type
 */
export type RegleCustomFieldStatus<
  T extends useRegleFn<any, any>,
  TState extends unknown = any,
  TRules extends RegleFormPropertyType<any, Partial<AllRulesDeclarations>> = InferRegleRules<T>,
> = RegleFieldStatus<TState, TRules, InferRegleShortcuts<T>>;

/**
 * Extract custom rules and custom shortcuts and apply them to a RegleFieldStatus type
 */
export type RegleCustomStatus<
  T extends useRegleFn<any, any>,
  TState extends Record<string, any> | undefined = Record<string, any>,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = InferRegleRules<T>,
> = RegleStatus<TState, TRules, InferRegleShortcuts<T>>;

/**
 * Extract custom rules and custom shortcuts and apply them to a RegleFieldStatus type
 */
export type RegleCustomCollectionStatus<
  T extends useRegleFn<any, any>,
  TState extends any[] = any[],
  TRules extends ReglePartialRuleTree<ArrayElement<TState>> = InferRegleRules<T>,
> = RegleCollectionStatus<TState, TRules, InferRegleShortcuts<T>>;
