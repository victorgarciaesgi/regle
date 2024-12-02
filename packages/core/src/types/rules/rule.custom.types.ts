import type { DefaultValidators } from '../../core/defaultValidators';
import type { RegleRuleRaw } from './rule.definition.type';

export type CustomRulesDeclarationTree = {
  [x: string]: RegleRuleRaw<any, any, boolean, any> | undefined;
};

export type AllRulesDeclarations = CustomRulesDeclarationTree & {
  [K in keyof DefaultValidators]: RegleRuleRaw<any, any, boolean, any> | undefined;
};
