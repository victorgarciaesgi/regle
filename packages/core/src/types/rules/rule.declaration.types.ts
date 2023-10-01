import { AllRulesDeclarations } from './rule.custom.types';
import { ShibieRuleDefinition, ShibieRuleWithParamsDefinition } from './rule.definition.type';

export type ShibiePartialValidationTree<
  TForm extends Record<string, any>,
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> = {
  [TKey in keyof TForm]?: ShibieFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * TODO nested forms
 */
export type ShibieFormPropertyType<
  TValue,
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> = NonNullable<TValue> extends Array<infer A>
  ? ShibieRuleDecl<NonNullable<TValue>, TCustomRules> & {
      $each?: ShibieRuleDecl<A, TCustomRules>;
    }
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
  TValue,
  TCustomRules extends AllRulesDeclarations = AllRulesDeclarations,
> = {
  [TKey in keyof TCustomRules]?: TCustomRules[TKey] extends ShibieRuleWithParamsDefinition<
    any,
    infer TParams
  >
    ? FormRuleDefinition<TValue, TParams>
    : FormRuleDefinition<TValue, any[]>;
};

/**
 * Inline rule declaration
 * TODO rename declaration
 * */
export type InlineRuleDefinition<TValue extends any, TParams extends any[] = []> = (
  value: TValue,
  ...params: TParams
) => boolean | Promise<boolean>;

/**
 * Regroup inline and registered rules
 * */
export type FormRuleDefinition<TValue extends any, TParams extends any[] = []> =
  | InlineRuleDefinition<TValue>
  | ShibieRuleDefinition<TValue, TParams>;
