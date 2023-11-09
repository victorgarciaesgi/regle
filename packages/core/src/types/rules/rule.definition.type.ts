import { RegleRuleInit } from './rule.init.types';
import { RegleUniversalParams } from './rule.params.types';
import { RegleInternalRuleDefs } from './rule.internal.types';
import { AllRulesDeclarations, RegleFormPropertyType, RegleRuleDecl } from '.';
import { ArrayElement, Maybe } from '../utils';

/**
 * Returned typed of rules created with `createRule`
 * */
export interface RegleRuleDefinition<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
> extends RegleInternalRuleDefs<TValue, TParams, TAsync> {
  validator: RegleRuleDefinitionProcessor<
    TValue,
    TParams,
    TAsync extends false ? boolean : Promise<boolean>
  >;
  message: RegleRuleDefinitionProcessor<TValue, TParams, string>;
  active: RegleRuleDefinitionProcessor<TValue, TParams, boolean>;
  type?: string;
  exec: (value: Maybe<TValue>) => TAsync extends false ? boolean : Promise<boolean>;
}

/**
 * Rules with params created with `createRules` are callable while being customizable
 */
export interface RegleRuleWithParamsDefinition<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
> extends RegleRuleInit<TValue, TParams, TAsync>,
    RegleInternalRuleDefs<TValue, TParams, TAsync> {
  (...params: RegleUniversalParams<TParams>): RegleRuleDefinition<TValue, TParams, TAsync>;
}

/**
 * Generic types for a created RegleRule
 */
export type RegleRuleRaw<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
> =
  | RegleRuleDefinition<TValue, TParams, TAsync>
  | RegleRuleWithParamsDefinition<TValue, TParams, TAsync>;

/**
 * Process the type of a created rule with `createRule`.
 * For a rule with params it will return a function
 * Otherwise it will return the rule definition
 */
export type InferRegleRule<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
> = [TParams] extends [[]]
  ? RegleRuleDefinition<TValue, TParams, TAsync>
  : RegleRuleWithParamsDefinition<TValue, TParams, TAsync>;

export type RegleRuleDefinitionProcessor<
  TValue extends any = any,
  TParams extends any[] = [],
  TReturn = any,
> = (value: Maybe<TValue>, ...args: TParams) => TReturn;

export type RegleCollectionRuleDefinition<
  TValue = any[],
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> =
  | (RegleRuleDecl<NonNullable<TValue>, TCustomRules> & {
      $each: RegleFormPropertyType<ArrayElement<TValue>, TCustomRules>;
    })
  | {
      $each: RegleFormPropertyType<ArrayElement<TValue>, TCustomRules>;
    };
