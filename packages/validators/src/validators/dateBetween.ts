import { ruleHelpers } from '../helpers';
import { createRule, defineType, Maybe, RegleRuleWithParamsDefinition } from '@regle/core';

export const dateBetween: RegleRuleWithParamsDefinition<
  Date,
  [before: Maybe<Date>, after: Maybe<Date>]
> = createRule({
  type: defineType<Date, [before: Maybe<Date>, after: Maybe<Date>]>('dateBetween'),
  validator: (value, before, after) => {
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
