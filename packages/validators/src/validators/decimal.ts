import { RegleRuleDefinition, createRule } from '@regle/core';
import { ruleHelpers } from 'helpers';

const decimalRegex = /^[-]?\d*(\.\d+)?$/;

export const decimal: RegleRuleDefinition<number | string> = createRule<number | string>({
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, decimalRegex);
  },
  message: 'Value must be decimal',
  type: 'decimal',
});
