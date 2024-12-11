import { ruleHelpers } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

export const dateAfter: RegleRuleWithParamsDefinition<
  string | Date,
  [after: Maybe<string | Date>],
  false,
  | true
  | {
      $valid: false;
      error: 'date-not-after';
    }
  | {
      $valid: false;
      error: 'value-or-paramater-not-a-date';
    }
> = createRule({
  type: 'dateAfter',
  validator: (value: Maybe<Date | string>, after: Maybe<Date | string>) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(after)) {
      if (ruleHelpers.isDate(value) && ruleHelpers.isDate(after)) {
        const result = ruleHelpers.toDate(value).getTime() > ruleHelpers.toDate(after).getTime();
        if (result) {
          return true;
        }
        return { $valid: false, error: 'date-not-after' as const };
      }
      return { $valid: false, error: 'value-or-paramater-not-a-date' as const };
    }
    return true;
  },
  message: ({ $params: [after], error }) => {
    if (error === 'value-or-paramater-not-a-date') {
      return 'The inputs must be Dates';
    }
    return `The date must be after ${formatLocaleDate(after)}`;
  },
});
