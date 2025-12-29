import { isFilled, isNumber, getSize } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';

/**
 * Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects and strings.
 *
 * @param max - The maximum length
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 *
 * @example
 * ```ts
 * import { maxLength } from '@regle/rules';
 *
 * const maxValue = ref(6);
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     maxLength: maxLength(6),
 *     // or with reactive value
 *     maxLength: maxLength(maxValue),
 *     // or with getter
 *     maxLength: maxLength(() => maxValue.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#maxlength Documentation}
 */
export const maxLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [max: number, options?: CommonComparisonOptions],
  false,
  boolean
> = createRule({
  type: 'maxLength',
  validator: (
    value: Maybe<string | Record<PropertyKey, any> | any[]>,
    max: number,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value, false) && isFilled(max)) {
      if (isNumber(max)) {
        if (allowEqual) {
          return getSize(value) <= max;
        } else {
          return getSize(value) < max;
        }
      }
      if (__IS_DEV__) {
        console.warn(`[maxLength] Value or parameter isn't a number, got value: ${value}, parameter: ${max}`);
      }
      return false;
    }
    return true;
  },
  message: ({ $value, $params: [count] }) => {
    if (Array.isArray($value)) {
      return `This list should have maximum ${count} items`;
    }
    return `The value length should not exceed ${count}`;
  },
});
