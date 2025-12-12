import { isFilled, isNumber, getSize } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';

/**
 * Requires the input value to have a minimum specified length, inclusive. Works with arrays, objects and strings.
 *
 * @param min - The minimum length
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 *
 * @example
 * ```ts
 * import { minLength } from '@regle/rules';
 *
 * const minValue = ref(6);
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     minLength: minLength(6),
 *     // or with reactive value
 *     minLength: minLength(minValue),
 *     // or with getter
 *     minLength: minLength(() => minValue.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#minlength Documentation}
 */
export const minLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [min: number, options?: CommonComparisonOptions],
  false,
  boolean
> = createRule({
  type: 'minLength',
  validator: (
    value: Maybe<string | Record<PropertyKey, any> | any[]>,
    min: number,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = true } = options ?? {};

    if (isFilled(value, false) && isFilled(min)) {
      if (isNumber(min)) {
        if (allowEqual) {
          return getSize(value) >= min;
        } else {
          return getSize(value) > min;
        }
      }
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${min}`);
      return false;
    }
    return true;
  },
  message: ({ $value, $params: [min] }) => {
    if (Array.isArray($value)) {
      return `The list should have at least ${min} items`;
    }
    return `The value length should be at least ${min}`;
  },
});
