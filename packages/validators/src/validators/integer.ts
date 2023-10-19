import { RegleRuleDefinition, createRule } from '@regle/core';
import { ruleHelpers } from 'helpers';

const integerRegex = /(^[0-9]*$)|(^-[0-9]+$)/;

export const integer: RegleRuleDefinition<number | string> = createRule<number | string>({
  validator(value) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, integerRegex);
  },
  message: 'Value must be an integer',
  type: 'integer',
});
