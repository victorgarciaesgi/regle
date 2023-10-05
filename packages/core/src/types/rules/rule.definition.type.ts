import { RegleRuleInit } from './rule.init.types';
import { RegleUniversalParams } from './rule.params.types';
import { RegleInternalRuleDefs } from './rule.internal.types';
import { AllRulesDeclarations, RegleFormPropertyType, RegleRuleDecl } from '.';
import { ArrayElement, Maybe } from '../utils';

/**
 * Returned typed of rules created with `createRule`
 * */
export interface RegleRuleDefinition<TValue extends any = any, TParams extends any[] = []>
  extends RegleInternalRuleDefs<TValue, TParams> {
  validator: RegleRuleDefinitionProcessor<TValue, TParams, boolean>;
  message: RegleRuleDefinitionProcessor<TValue, TParams, string>;
  active: RegleRuleDefinitionProcessor<TValue, TParams, boolean>;
  type: string;
}

/**
 * Rules with params created with `createRules` are callable while being customizable
 */
export interface RegleRuleWithParamsDefinition<TValue extends any = any, TParams extends any[] = []>
  extends RegleRuleInit<TValue, TParams>,
    RegleInternalRuleDefs<TValue, TParams> {
  (...params: RegleUniversalParams<TParams>): RegleRuleDefinition<TValue, TParams>;
}

/**
 * Generic types for a created RegleRule
 */
export type RegleRuleRaw<TValue extends any = any, TParams extends any[] = []> =
  | RegleRuleDefinition<TValue, TParams>
  | RegleRuleWithParamsDefinition<TValue, TParams>;

/**
 * Process the type of a created rule with `createRule`.
 * For a rule with params it will return a function
 * Otherwise it will return the rule definition
 */
export type InferRegleRule<TValue extends any = any, TParams extends any[] = []> = [
  TParams,
] extends [[]]
  ? RegleRuleDefinition<TValue, TParams>
  : RegleRuleWithParamsDefinition<TValue, TParams>;

export type RegleRuleDefinitionProcessor<
  TValue extends any = any,
  TParams extends any[] = [],
  TReturn = any,
> = (value: Maybe<TValue>, ...args: TParams) => TReturn;

export type RegleCollectionRuleDefinition<
  TValue = any[],
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> =
  | (RegleRuleDecl<NonNullable<TValue>, TCustomRules> & {
      $each: RegleFormPropertyType<ArrayElement<TValue>, TCustomRules>;
    })
  | {
      $each: RegleFormPropertyType<ArrayElement<TValue>, TCustomRules>;
    };
