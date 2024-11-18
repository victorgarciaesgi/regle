import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

const alphaRegex = /^[a-zA-Z]*$/;

export const alpha: RegleRuleDefinition<string, [], false, boolean, string> = createRule({
  type: 'alpha',
  validator(value: Maybe<string>) {
    if (ruleHelpers.isEmpty(value)) {
      return true;
    }
    return ruleHelpers.regex(value, alphaRegex);
  },
  message: 'The value is not alphabetical',
});
