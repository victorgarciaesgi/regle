import type { DefaultValidators } from '../../core/defaultValidators';
import type { RegleRuleRawInput } from './rule.definition.type';

export type CustomRulesDeclarationTree = {
  [x: string]: RegleRuleRawInput<any, any[], boolean, any> | undefined;
};

export type DefaultValidatorsTree = {
  [K in keyof DefaultValidators]: RegleRuleRawInput<any, any[], boolean, any> | undefined;
};

export type ExtendedRulesDeclarations = CustomRulesDeclarationTree & DefaultValidatorsTree;

/** @deprecated Use {@link ExtendedRulesDeclarations} instead */
export type AllRulesDeclarations = ExtendedRulesDeclarations;
