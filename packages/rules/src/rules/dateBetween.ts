import { isDate, toDate } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition, CommonComparisonOptions } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date falls between the specified bounds.
 *
 * @param before - the minimum limit
 * @param after - the maximum limit
 * @param options - comparison options
 */
export const dateBetween: RegleRuleWithParamsDefinition<
  string | Date,
  [before: Maybe<string | Date>, after: Maybe<string | Date>, options?: CommonComparisonOptions],
  false,
  boolean
> = createRule({
  type: 'dateBetween',
  validator: (
    value: Maybe<Date | string>,
    before: Maybe<Date | string>,
    after: Maybe<Date | string>,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = false } = options ?? {};
    if (isDate(value) && isDate(before) && isDate(after)) {
      if (allowEqual) {
        return toDate(value).getTime() >= toDate(before).getTime() &&
               toDate(value).getTime() <= toDate(after).getTime();
      } else {
        return toDate(value).getTime() > toDate(before).getTime() &&
               toDate(value).getTime() < toDate(after).getTime();
      }
    }
    return true;
  },
  message: ({ $params: [before, after] }) => {
    return `The date must be between ${formatLocaleDate(before)} and ${formatLocaleDate(after)}`;
  },
});
