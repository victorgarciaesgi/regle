import { ruleHelpers } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';

export const dateBefore: RegleRuleWithParamsDefinition<
  string | Date,
  [before: Maybe<string | Date>],
  false,
  | true
  | {
      $valid: false;
      error: 'date-not-before';
    }
  | {
      $valid: false;
      error: 'value-or-paramater-not-a-date';
    }
> = createRule({
  type: defineType<Date | string, [before: Maybe<Date | string>]>('dateBefore'),
  validator: (value, before) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(before)) {
      if (ruleHelpers.isDate(value) && ruleHelpers.isDate(before)) {
        const result = ruleHelpers.toDate(value).getTime() < ruleHelpers.toDate(before).getTime();
        if (result) {
          return true;
        }
        return { $valid: false, error: 'date-not-before' as const };
      }
      return { $valid: false, error: 'value-or-paramater-not-a-date' as const };
    }
    return true;
  },
  message: (_, { $params: [before], error }) => {
    if (error === 'value-or-paramater-not-a-date') {
      return 'The inputs must be Dates';
    }
    return `The date must be before ${before}`;
  },
});
