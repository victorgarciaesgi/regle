import type { RegleRuleDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

const integerRegex = /(^[0-9]*$)|(^-[0-9]+$)/;

export const integer: RegleRuleDefinition<string | number, [], false, boolean, string | number> =
  createRule({
    type: defineType<number | string>('integer'),
    validator(value) {
      if (ruleHelpers.isEmpty(value)) {
        return true;
      }
      return ruleHelpers.regex(value, integerRegex);
    },
    message: 'Value must be an integer',
  });
