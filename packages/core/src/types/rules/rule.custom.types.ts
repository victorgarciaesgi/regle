import { DefaultValidators } from '../../core/defaultValidators';
import { ShibieRuleRaw } from './rule.definition.type';

export type CustomRulesDeclarationTree = Record<string, ShibieRuleRaw<any, any>>;
export type AllRulesDeclarations = CustomRulesDeclarationTree & DefaultValidators;
