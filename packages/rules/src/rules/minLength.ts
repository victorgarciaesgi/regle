import { isFilled, isNumber, getSize } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';

/**
 * Requires the input value to have a minimum specified length, inclusive. Works with arrays, objects and strings.
 *
 * @param min - the minimum value
 * @param options - comparision options
 */
export const minLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [count: number, options?: CommonComparisonOptions],
  false,
  boolean
> = createRule({
  type: 'minLength',
  validator: (
    value: Maybe<string | Record<PropertyKey, any> | any[]>,
    count: number,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = true } = options ?? {};

    if (isFilled(value, false) && isFilled(count)) {
      if (isNumber(count)) {
        if (allowEqual) {
          return getSize(value) >= count;
        } else {
          return getSize(value) > count;
        }
      }
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${count}`);
      return false;
    }
    return true;
  },
  message: ({ $value, $params: [count] }) => {
    if (Array.isArray($value)) {
      return `The list should have at least ${count} items`;
    }
    return `The value length should be at least ${count}`;
  },
});
