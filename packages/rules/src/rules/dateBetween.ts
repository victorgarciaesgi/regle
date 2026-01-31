import { isDate, toDate } from '../helpers';
import type { MaybeInput, RegleRuleWithParamsDefinition, CommonComparisonOptions } from '@regle/core';
import { createRule } from '@regle/core';
import { formatLocaleDate } from '../utils/getLocale.util';

/**
 * Checks if the date falls between the specified bounds.
 *
 * @param before - The minimum date limit
 * @param after - The maximum date limit
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 * @param options.allowEqual - Optional flag to allow equal dates
 *
 * @example
 * ```ts
 * import { dateBetween } from '@regle/rules';
 *
 * const { r$ } = useRegle({ birthday: null as Date | null }, {
 *   birthday: {
 *     dateBetween: dateBetween(new Date(), new Date(2030, 3, 1)),
 *     // or with options
 *     dateBetween: dateBetween(new Date(), new Date(2030, 3, 1), { allowEqual: false }),
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#datebetween Documentation}
 */
export const dateBetween: RegleRuleWithParamsDefinition<
  'dateBetween',
  string | Date,
  [before: MaybeInput<string | Date>, after: MaybeInput<string | Date>, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<string | Date>
> = createRule({
  type: 'dateBetween',
  validator: (
    value: MaybeInput<Date | string>,
    before: MaybeInput<Date | string>,
    after: MaybeInput<Date | string>,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = true } = options ?? {};
    if (isDate(value) && isDate(before) && isDate(after)) {
      if (allowEqual) {
        return (
          toDate(value).getTime() >= toDate(before).getTime() && toDate(value).getTime() <= toDate(after).getTime()
        );
      } else {
        return toDate(value).getTime() > toDate(before).getTime() && toDate(value).getTime() < toDate(after).getTime();
      }
    }
    return true;
  },
  message: ({ $params: [before, after] }) => {
    return `The date must be between ${formatLocaleDate(before)} and ${formatLocaleDate(after)}`;
  },
});
