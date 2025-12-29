import type { CommonComparisonOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, toNumber } from '../helpers';

/**
 * Requires a field to have a specified maximum numeric value.
 *
 * @param max - The maximum value
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 *
 * @example
 * ```ts
 * import { maxValue } from '@regle/rules';
 *
 * const maxCount = ref(6);
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: {
 *     maxValue: maxValue(6),
 *     // or with options
 *     maxValue: maxValue(maxCount, { allowEqual: false }),
 *     // or with getter
 *     maxValue: maxValue(() => maxCount.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#maxvalue Documentation}
 */
export const maxValue: RegleRuleWithParamsDefinition<
  number | string,
  [max: number | string, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<number | string>
> = createRule({
  type: 'maxValue',
  validator: (value: MaybeInput<number | string>, max: number | string, options?: CommonComparisonOptions) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value) && isFilled(max)) {
      if (!isNaN(toNumber(value)) && !isNaN(toNumber(max))) {
        if (allowEqual) {
          return toNumber(value) <= toNumber(max);
        } else {
          return toNumber(value) < toNumber(max);
        }
      }
      if (__IS_DEV__) {
        console.warn(`[maxValue] Value or parameter isn't a number, got value: ${value}, parameter: ${max}`);
      }
      return false;
    }
    return true;
  },
  message: ({ $params: [max, options] }) => {
    const { allowEqual = true } = options ?? {};
    if (allowEqual) {
      return `The value must be less than or equal to ${max}`;
    } else {
      return `The value must be less than ${max}`;
    }
  },
});
