import { RegleRuleDefinition, createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

const decimalRegex = /^[-]?\d*(\.\d+)?$/;

export const decimal: RegleRuleDefinition<string | number, [], false, boolean, string | number> =
  createRule({
    type: defineType<number | string>('decimal'),
    validator(value) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return ruleHelpers.regex(value, decimalRegex);
    },
    message: 'Value must be decimal',
  });
