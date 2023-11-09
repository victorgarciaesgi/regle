import { RegleRuleDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

const alphaNumRegex = /^[a-zA-Z0-9]*$/;

export const alphaNum: RegleRuleDefinition<string | number> = createRule<string | number>({
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, alphaNumRegex);
  },
  message: 'The value must be alpha-numeric',
  type: 'alpha',
});
