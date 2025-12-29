import { isFilled, isNumber, getSize } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';

/**
 * Requires the input value to have a strict specified length. Works with arrays, objects and strings.
 *
 * @param count - The exact required length
 *
 * @example
 * ```ts
 * import { exactLength } from '@regle/rules';
 *
 * const exactValue = ref(6);
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     exactLength: exactLength(6),
 *     // or with reactive value
 *     exactLength: exactLength(exactValue),
 *     // or with getter
 *     exactLength: exactLength(() => exactValue.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#exactlength Documentation}
 */
export const exactLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [count: number],
  false,
  boolean
> = createRule({
  type: 'exactLength',
  validator: (value: Maybe<string | Record<PropertyKey, any> | any[]>, count: number) => {
    if (isFilled(value, false) && isFilled(count)) {
      if (isNumber(count)) {
        return getSize(value) === count;
      }
      if (__IS_DEV__) {
        console.warn(`[exactLength] Parameter isn't a number, got parameter: ${count}`);
      }
      return false;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `The value should be exactly ${count} characters long`;
  },
});
