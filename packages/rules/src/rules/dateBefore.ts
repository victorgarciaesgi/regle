import { isFilled, toDate, isDate } from '../helpers';
import type { MaybeInput, RegleRuleWithParamsDefinition, CommonComparisonOptions } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date is before the given parameter.
 *
 * @param before - The date to compare to (can be a `Date`, string, ref, or getter)
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 * @param options.allowEqual - Optional flag to allow equal dates
 *
 * @example
 * ```ts
 * import { dateBefore } from '@regle/rules';
 *
 * const { r$ } = useRegle({ birthday: null as Date | null }, {
 *   birthday: {
 *     dateBefore: dateBefore(new Date()),
 *     // or with options
 *     dateBefore: dateBefore(new Date(), { allowEqual: false }),
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#datebefore Documentation}
 */
export const dateBefore: RegleRuleWithParamsDefinition<
  string | Date,
  [before: MaybeInput<string | Date>, options?: CommonComparisonOptions],
  false,
  | true
  | {
      $valid: false;
      error: 'date-not-before';
    }
  | {
      $valid: false;
      error: 'value-or-parameter-not-a-date';
    },
  MaybeInput<string | Date>
> = createRule({
  type: 'dateBefore',
  validator: (
    value: MaybeInput<Date | string>,
    before: MaybeInput<Date | string>,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value) && isFilled(before)) {
      if (isDate(value) && isDate(before)) {
        const result = allowEqual
          ? toDate(value).getTime() <= toDate(before).getTime()
          : toDate(value).getTime() < toDate(before).getTime();
        if (result) {
          return true;
        }
        return { $valid: false, error: 'date-not-before' as const };
      }
      return { $valid: false, error: 'value-or-parameter-not-a-date' as const };
    }
    return true;
  },
  message: ({ $params: [before], error }) => {
    if (error === 'value-or-parameter-not-a-date') {
      return 'The values must be dates';
    }

    return `The date must be before ${formatLocaleDate(before)}`;
  },
});
