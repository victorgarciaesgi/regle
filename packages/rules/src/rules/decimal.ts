import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

const decimalRegex = /^[-]?\d*(\.\d+)?$/;

export const decimal: RegleRuleDefinition<string | number, [], false, boolean, string | number> =
  createRule({
    type: 'decimal',
    validator(value: Maybe<number | string>) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return ruleHelpers.regex(value, decimalRegex);
    },
    message: 'Value must be decimal',
  });
