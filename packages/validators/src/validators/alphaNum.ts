import { RegleRuleDefinition, createRule } from '@regle/core';
import { ruleHelpers } from 'helpers';

const alphaNumRegex = /^[a-zA-Z]*$/;

export const alphaNum: RegleRuleDefinition<string | number> = createRule<string | number>({
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, alphaNumRegex);
  },
  message: 'Value must be an only alphabetic or numeric',
  type: 'alpha',
});
