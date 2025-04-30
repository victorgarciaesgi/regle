import { isFilled, isDate, toDate } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition, CommonComparisonOptions } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date is after the given parameter.
 *
 * @param after - the date to compare to
 * @param options - comparison options
 */
export const dateAfter: RegleRuleWithParamsDefinition<
  string | Date,
  [after: Maybe<string | Date>, options?: CommonComparisonOptions],
  false,
  | true
  | {
      $valid: false;
      error: 'date-not-after';
    }
  | {
      $valid: false;
      error: 'value-or-parameter-not-a-date';
    }
> = createRule({
  type: 'dateAfter',
  validator: (
    value: Maybe<Date | string>,
    after: Maybe<Date | string>,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value) && isFilled(after)) {
      if (isDate(value) && isDate(after)) {
        const result = allowEqual
          ? toDate(value).getTime() >= toDate(after).getTime()
          : toDate(value).getTime() > toDate(after).getTime();
        if (result) {
          return true;
        }
        return { $valid: false, error: 'date-not-after' as const };
      }
      return { $valid: false, error: 'value-or-parameter-not-a-date' as const };
    }
    return true;
  },
  message: ({ $params: [after], error }) => {
    if (error === 'value-or-parameter-not-a-date') {
      return 'The values must be dates';
    }
    return `The date must be after ${formatLocaleDate(after)}`;
  },
});
