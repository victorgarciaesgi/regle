import { ruleHelpers } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';

export const dateAfter: RegleRuleWithParamsDefinition<
  string | Date,
  [after: Maybe<string | Date>],
  false,
  boolean
> = createRule({
  type: defineType<Date | string, [after: Maybe<Date | string>]>('dateAfter'),
  validator: (value, after) => {
    if (ruleHelpers.isDate(value) && ruleHelpers.isDate(after)) {
      return ruleHelpers.toDate(value).getTime() > ruleHelpers.toDate(after).getTime();
    }
    return true;
  },
  message: (_, { $params: [after] }) => {
    return `The date must be after ${after}`;
  },
});
