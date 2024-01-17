import { ruleHelpers } from '../helpers';
import { createRule, defineType, Maybe, RegleRuleWithParamsDefinition } from '@regle/core';

export const dateBefore: RegleRuleWithParamsDefinition<Date, [before: Maybe<Date>]> = createRule({
  type: defineType<Date, [before: Maybe<Date>]>('dateBefore'),
  validator: (value, before) => {
    if (ruleHelpers.isDate(value) && ruleHelpers.isDate(before)) {
      return ruleHelpers.toDate(value).getTime() < ruleHelpers.toDate(before).getTime();
    }
    return true;
  },
  message: (_, { $params: [before] }) => {
    return `The date must be before ${before}`;
  },
});
