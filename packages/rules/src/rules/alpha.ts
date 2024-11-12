import type { RegleRuleDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

const alphaRegex = /^[a-zA-Z]*$/;

export const alpha: RegleRuleDefinition<string, [], false, boolean, string> = createRule({
  type: defineType<string>('alpha'),
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, alphaRegex);
  },
  message: 'The value is not alphabetical',
});
