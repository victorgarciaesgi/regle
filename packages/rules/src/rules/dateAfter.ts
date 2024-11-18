import { ruleHelpers } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';

export const dateAfter: RegleRuleWithParamsDefinition<
  string | Date,
  [after: Maybe<string | Date>],
  false,
  boolean
> = createRule({
  type: 'dateAfter',
  validator: (value: Maybe<Date | string>, after: Maybe<Date | string>) => {
    if (ruleHelpers.isDate(value) && ruleHelpers.isDate(after)) {
      return ruleHelpers.toDate(value).getTime() > ruleHelpers.toDate(after).getTime();
    }
    return true;
  },
  message: (_, { $params: [after] }) => {
    return `The date must be after ${after}`;
  },
});
