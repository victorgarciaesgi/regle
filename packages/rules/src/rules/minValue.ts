import type { CommonComparisonOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, toNumber } from '../helpers';

/**
 * Requires a field to have a specified minimum numeric value.
 *
 * @param min - The minimum value
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 *
 * @example
 * ```ts
 * import { minValue } from '@regle/rules';
 *
 * const minCount = ref(6);
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: {
 *     minValue: minValue(6),
 *     // or with options
 *     minValue: minValue(minCount, { allowEqual: false }),
 *     // or with getter
 *     minValue: minValue(() => minCount.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#minvalue Documentation}
 */
export const minValue: RegleRuleWithParamsDefinition<
  number | string,
  [min: number | string, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<number | string>
> = createRule({
  type: 'minValue',
  validator: (value: MaybeInput<number | string>, min: number | string, options?: CommonComparisonOptions) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value) && isFilled(min)) {
      if (!isNaN(toNumber(value)) && !isNaN(toNumber(min))) {
        if (allowEqual) {
          return toNumber(value) >= toNumber(min);
        } else {
          return toNumber(value) > toNumber(min);
        }
      }
      console.warn(`[minValue] Value or parameter isn't a number, got value: ${value}, parameter: ${min}`);
      return false;
    }
    return true;
  },
  message: ({ $params: [min, options] }) => {
    const { allowEqual = true } = options ?? {};
    if (allowEqual) {
      return `The value must be greater than or equal to ${min}`;
    } else {
      return `The value must be greater than ${min}`;
    }
  },
});
