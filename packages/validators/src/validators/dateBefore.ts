import { ruleHelpers } from '../helpers';
import { createRule, Maybe, RegleRuleWithParamsDefinition } from '@regle/core';

export const dateBefore: RegleRuleWithParamsDefinition<Date, [before: Maybe<Date>]> = createRule<
  Date,
  [before: Maybe<Date>]
>({
  validator: (value, before) => {
    if (ruleHelpers.isDate(value) && ruleHelpers.isDate(before)) {
      return ruleHelpers.toDate(value).getTime() < ruleHelpers.toDate(before).getTime();
    }
    return true;
  },
  message: (_, { $params: [before] }) => {
    return `The date must be before ${before}`;
  },
  type: 'dateBefore',
});
