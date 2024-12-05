import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const regex: RegleRuleWithParamsDefinition<
  string | number,
  [...regexp: RegExp[]],
  false,
  boolean
> = createRule({
  type: 'regex',
  validator(value: Maybe<string | number>, ...regexp: RegExp[]) {
    if (ruleHelpers.isFilled(value)) {
      return ruleHelpers.regex(value, ...regexp);
    }
    return true;
  },
  message: 'This field does not match the required pattern',
});
