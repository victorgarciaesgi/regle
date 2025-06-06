import type { DefaultValidators } from '../../core';
import type { useRegleFn } from '../../core/useRegle';
import type {
  DefaultValidatorsTree,
  RegleFieldStatus,
  SuperCompatibleRegle,
  UnwrapRuleTree,
  UnwrapRuleWithParams,
} from '../rules';

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
  T extends useRegleFn<infer U, any> ? UnwrapRuleTree<Partial<DefaultValidators>> & UnwrapRuleTree<Partial<U>> : {};

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
  T extends useRegleFn<any, any>,
  TRules extends keyof InferRegleRules<T>,
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
  TRules extends keyof InferRegleRules<T> = never,
> = RegleFieldStatus<
  TState,
  [TRules] extends [never] ? Partial<InferRegleRules<T>> : RegleEnforceCustomRequiredRules<T, TRules>,
  InferRegleShortcuts<T>
>;
