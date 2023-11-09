import { DefaultValidators } from '../../core/defaultValidators';
import { RegleRuleRaw } from './rule.definition.type';

export type CustomRulesDeclarationTree = {
  [x: string]: RegleRuleRaw<any, any, boolean> | undefined;
};
export type AllRulesDeclarations = CustomRulesDeclarationTree & DefaultValidators;
