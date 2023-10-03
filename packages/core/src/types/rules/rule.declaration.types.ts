import { ArrayElement } from '../utils';
import { AllRulesDeclarations } from './rule.custom.types';
import { ShibieRuleDefinition, ShibieRuleWithParamsDefinition } from './rule.definition.type';

export type ShibiePartialValidationTree<
  TForm extends Record<string, any>,
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> = {
  [TKey in keyof TForm]?: ShibieFormPropertyType<TForm[TKey], TCustomRules>;
};

export type ShibieFormPropertyType<
  TValue = any,
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> = NonNullable<TValue> extends Array<any>
  ? ShibieCollectionRuleDecl<TValue, TCustomRules>
  : NonNullable<TValue> extends Date
  ? ShibieRuleDecl<NonNullable<TValue>, TCustomRules>
  : NonNullable<TValue> extends File
  ? ShibieRuleDecl<NonNullable<TValue>, TCustomRules>
  : NonNullable<TValue> extends Record<string, any>
  ? ShibiePartialValidationTree<NonNullable<TValue>, TCustomRules>
  : ShibieRuleDecl<NonNullable<TValue>, TCustomRules>;

/**
 * Rule tree for a form property
 */
export type ShibieRuleDecl<
  TValue = any,
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> = {
  [TKey in keyof TCustomRules]?: TCustomRules[TKey] extends ShibieRuleWithParamsDefinition<
    any,
    infer TParams
  >
    ? ShibieRuleDefinition<TValue, TParams>
    : FormRuleDeclaration<TValue, any[]>;
};

export type ShibieCollectionRuleDecl<
  TValue = any[],
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> = ShibieRuleDecl<NonNullable<TValue>, TCustomRules> & {
  $each?: ShibieRuleDecl<ArrayElement<TValue>, TCustomRules>;
};

/**
 * TODO async
 */
export type InlineRuleDeclaration<TValue extends any, TParams extends any[] = []> = (
  value: TValue,
  ...params: TParams
) => boolean;

/**
 * Regroup inline and registered rules
 * */
export type FormRuleDeclaration<TValue extends any, TParams extends any[] = []> =
  | InlineRuleDeclaration<TValue>
  | ShibieRuleDefinition<TValue, TParams>;
