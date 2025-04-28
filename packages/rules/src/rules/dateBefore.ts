import { isFilled, toDate, isDate } from '../helpers';
import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date is before the given parameter.
 *
 * @param before - the date to compare to
 */
export const dateBefore: RegleRuleWithParamsDefinition<
  string | Date,
  [before: MaybeInput<string | Date>],
  false,
  | true
  | {
      $valid: false;
      error: 'date-not-before';
    }
  | {
      $valid: false;
      error: 'value-or-paramater-not-a-date';
    },
  MaybeInput<string | Date>
> = createRule({
  type: 'dateBefore',
  validator: (value: MaybeInput<Date | string>, before: MaybeInput<Date | string>) => {
    if (isFilled(value) && isFilled(before)) {
      if (isDate(value) && isDate(before)) {
        const result = toDate(value).getTime() < toDate(before).getTime();
        if (result) {
          return true;
        }
        return { $valid: false, error: 'date-not-before' as const };
      }
      return { $valid: false, error: 'value-or-paramater-not-a-date' as const };
    }
    return true;
  },
  message: ({ $params: [before], error }) => {
    if (error === 'value-or-paramater-not-a-date') {
      return 'The values must be dates';
    }

    return `The date must be before ${formatLocaleDate(before)}`;
  },
});
