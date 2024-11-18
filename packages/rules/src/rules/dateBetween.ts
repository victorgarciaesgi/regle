import { ruleHelpers } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';

export const dateBetween: RegleRuleWithParamsDefinition<
  string | Date,
  [before: Maybe<string | Date>, after: Maybe<string | Date>],
  false,
  boolean
> = createRule({
  type: 'dateBetween',
  validator: (
    value: Maybe<Date | string>,
    before: Maybe<Date | string>,
    after: Maybe<Date | string>
  ) => {
    if (ruleHelpers.isDate(value) && ruleHelpers.isDate(before) && ruleHelpers.isDate(after)) {
      return (
        ruleHelpers.toDate(value).getTime() > ruleHelpers.toDate(before).getTime() &&
        ruleHelpers.toDate(value).getTime() < ruleHelpers.toDate(after).getTime()
      );
    }
    return true;
  },
  message: (_, { $params: [before, after] }) => {
    return `The date must be between ${before} and ${after}`;
  },
});
