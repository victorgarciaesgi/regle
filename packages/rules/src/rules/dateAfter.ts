import { isFilled, isDate, toDate } from '../helpers';
import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date is after the given parameter.
 *
 * @param after - the date to compare to
 */
export const dateAfter: RegleRuleWithParamsDefinition<
  string | Date,
  [after: MaybeInput<string | Date>],
  false,
  | true
  | {
      $valid: false;
      error: 'date-not-after';
    }
  | {
      $valid: false;
      error: 'value-or-paramater-not-a-date';
    },
  MaybeInput<string | Date>
> = createRule({
  type: 'dateAfter',
  validator: (value: MaybeInput<Date | string>, after: MaybeInput<Date | string>) => {
    if (isFilled(value) && isFilled(after)) {
      if (isDate(value) && isDate(after)) {
        const result = toDate(value).getTime() > toDate(after).getTime();
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
      return 'The values must be dates';
    }
    return `The date must be after ${formatLocaleDate(after)}`;
  },
});
