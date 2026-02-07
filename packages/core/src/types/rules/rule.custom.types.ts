import type { DefaultValidators } from '../../core/defaultValidators';
import type { RegleRuleRawInput } from './rule.definition.type';

export type CustomRulesDeclarationTree = {
  [x: string]: RegleRuleRawInput<any, any[], boolean, any> | undefined;
};

export type DefaultValidatorsTree = {
  [K in keyof DefaultValidators]: RegleRuleRawInput<any, any[], boolean, any> | undefined;
};

export interface CustomRules {}

export type ExtendedRulesDeclarations = CustomRulesDeclarationTree & DefaultValidatorsTree & CustomRules;

/** @deprecated Use {@link ExtendedRulesDeclarations} instead */
export type AllRulesDeclarations = ExtendedRulesDeclarations;
