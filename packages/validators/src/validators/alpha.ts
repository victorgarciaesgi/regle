import { RegleRuleDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

const alphaRegex = /^[a-zA-Z]*$/;

export const alpha: RegleRuleDefinition<string> = createRule<string>({
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, alphaRegex);
  },
  message: 'The value is not alphabetical',
  type: 'alpha',
});
