import { ruleHelpers } from '../helpers';
import { createRule, defineType, Maybe, RegleRuleWithParamsDefinition } from '@regle/core';

export const dateBetween: RegleRuleWithParamsDefinition<
  string | Date,
  [before: Maybe<string | Date>, after: Maybe<string | Date>],
  false,
  boolean
> = createRule({
  type: defineType<Date | string, [before: Maybe<Date | string>, after: Maybe<Date | string>]>(
    'dateBetween'
  ),
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
