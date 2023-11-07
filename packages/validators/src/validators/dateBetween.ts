import { ruleHelpers } from '../helpers';
import { createRule, Maybe, RegleRuleWithParamsDefinition } from '@regle/core';

export const dateBetween: RegleRuleWithParamsDefinition<
  Date,
  [before: Maybe<Date>, after: Maybe<Date>]
> = createRule<Date, [before: Maybe<Date>, after: Maybe<Date>]>({
  validator: (value, after) => {
    if (ruleHelpers.isDate(value) && ruleHelpers.isDate(after)) {
      return ruleHelpers.toDate(value).getTime() < ruleHelpers.toDate(after).getTime();
    }
    return true;
  },
  message: (_, after) => {
    return `The date must be before ${after}`;
  },
  type: 'dateBetween',
});
