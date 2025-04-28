import { isDate, toDate } from '../helpers';
import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date falls between the specified bounds.
 *
 * @param before - the minimum limit
 * @param after - the maximum limit
 */
export const dateBetween: RegleRuleWithParamsDefinition<
  string | Date,
  [before: MaybeInput<string | Date>, after: MaybeInput<string | Date>],
  false,
  boolean,
  MaybeInput<string | Date>
> = createRule({
  type: 'dateBetween',
  validator: (
    value: MaybeInput<Date | string>,
    before: MaybeInput<Date | string>,
    after: MaybeInput<Date | string>
  ) => {
    if (isDate(value) && isDate(before) && isDate(after)) {
      return toDate(value).getTime() > toDate(before).getTime() && toDate(value).getTime() < toDate(after).getTime();
    }
    return true;
  },
  message: ({ $params: [before, after] }) => {
    return `The date must be between ${formatLocaleDate(before)} and ${formatLocaleDate(after)}`;
  },
});
