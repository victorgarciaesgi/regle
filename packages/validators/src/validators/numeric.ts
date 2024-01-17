import { RegleRuleDefinition, createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

const numericRegex = /^\d*(\.\d+)?$/;

export const numeric: RegleRuleDefinition<number | string> = createRule({
  type: defineType<number | string>('numeric'),
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, numericRegex);
  },
  message: 'Value must be numeric',
});
