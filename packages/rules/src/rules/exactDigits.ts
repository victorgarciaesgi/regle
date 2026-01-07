import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, isNumber, matchRegex } from '../helpers';

/**
 * Requires the input value to have a strict specified length. Works with arrays, objects and strings.
 *
 * @param count - The exact required length
 *
 * @example
 * ```ts
 * import { exactDigits } from '@regle/rules';
 *
 * const exactValue = ref(6);
 *
 * const { r$ } = useRegle({ digits: '' }, {
 *   digits: {
 *     exactDigits: exactDigits(6),
 *     // or with reactive value
 *     exactDigits: exactDigits(exactValue),
 *     // or with getter
 *     exactDigits: exactDigits(() => exactValue.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#exactdigits Documentation}
 */
export const exactDigits: RegleRuleWithParamsDefinition<string | number, [count: number], false, boolean> = createRule({
  type: 'exactDigits',
  validator: (value: Maybe<string | number>, count: number) => {
    if (isFilled(value, false) && isFilled(count)) {
      if (isNumber(count)) {
        const digitsRegex = new RegExp(`^\\d{${count}}$`);
        return matchRegex(value.toString(), digitsRegex);
      }
      if (__IS_DEV__) {
        console.warn(`[exactDigits] Parameter isn't a number, got parameter: ${count}`);
      }
      return true;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `The value should have exactly ${count} digits`;
  },
});
