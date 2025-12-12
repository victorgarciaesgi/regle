import { isFilled, isDate, toDate } from '../helpers';
import type { MaybeInput, RegleRuleWithParamsDefinition, CommonComparisonOptions } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date is after the given parameter.
 *
 * @param after - The date to compare to (can be a `Date`, string, ref, or getter)
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 *
 * @example
 * ```ts
 * import { dateAfter } from '@regle/rules';
 *
 * const { r$ } = useRegle({ birthday: null as Date | null }, {
 *   birthday: {
 *     dateAfter: dateAfter(new Date()),
 *     // or with options
 *     dateAfter: dateAfter(new Date(), { allowEqual: false }),
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#dateafter Documentation}
 */
export const dateAfter: RegleRuleWithParamsDefinition<
  string | Date,
  [after: MaybeInput<string | Date>, options?: CommonComparisonOptions],
  false,
  | true
  | {
      $valid: false;
      error: 'date-not-after';
    }
  | {
      $valid: false;
      error: 'value-or-parameter-not-a-date';
    },
  MaybeInput<string | Date>
> = createRule({
  type: 'dateAfter',
  validator: (
    value: MaybeInput<Date | string>,
    after: MaybeInput<Date | string>,
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
