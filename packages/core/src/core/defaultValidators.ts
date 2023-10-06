import { RegleRuleDefinition, RegleRuleWithParamsDefinition } from '../types';

export type DefaultValidators = {
  maxLength: RegleRuleWithParamsDefinition<string, [count: number]>;
  required: RegleRuleDefinition<unknown, []>;
  requiredIf: RegleRuleWithParamsDefinition<unknown, [condition: boolean]>;
};
