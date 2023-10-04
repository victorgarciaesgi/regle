import { DefaultValidators } from '../../core/defaultValidators';
import { RegleRuleRaw } from './rule.definition.type';

export type CustomRulesDeclarationTree = Record<string, RegleRuleRaw<any, any>>;
export type AllRulesDeclarations = CustomRulesDeclarationTree & DefaultValidators;
