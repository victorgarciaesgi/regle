import { ShibieRuleInit } from './create-rule.types';
import { ShibieUniversalParams } from './rule.params.types';
import { ShibieInternalRuleDefs } from './rule.internal.types';

/**
 * Returned typed of rules created with `createRule`
 * */
export interface ShibieRuleDefinition<TValue extends any = any, TParams extends any[] = []>
  extends ShibieInternalRuleDefs<TValue, TParams> {
  validator: (value: TValue, ...args: TParams) => boolean;
  message: (value: TValue, ...args: TParams) => string;
  active: (value: TValue, ...args: TParams) => boolean;
  type: string;
}

/**
 * Rules with params created with `createRules` are callable while being customizable
 */
export interface ShibieRuleWithParamsDefinition<
  TValue extends any = any,
  TParams extends any[] = [],
> extends ShibieRuleInit<TValue, TParams>,
    ShibieInternalRuleDefs<TValue, TParams> {
  (...params: ShibieUniversalParams<TParams>): ShibieRuleDefinition<TValue, TParams>;
}

/**
 * Generic types for a created ShibieRule
 */
export type ShibieRuleRaw<TValue extends any = any, TParams extends any[] = []> =
  | ShibieRuleDefinition<TValue, TParams>
  | ShibieRuleWithParamsDefinition<TValue, TParams>;

/**
 * Process the type of a created rule with `createRule`.
 * For a rule with params it will return a function
 * Otherwise it will return the rule definition
 */
export type InferShibieRule<TValue extends any = any, TParams extends any[] = []> = [
  TParams,
] extends [[]]
  ? ShibieRuleDefinition<TValue, TParams>
  : ShibieRuleWithParamsDefinition<TValue, TParams>;
