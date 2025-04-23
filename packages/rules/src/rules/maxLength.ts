import { isFilled, isNumber, getSize } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';

/**
 * Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects and strings.
 *
 * @param max - the maximum length
 * @param options - comparision options
 */
export const maxLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [count: number, options?: CommonComparisonOptions],
  false,
  boolean
> = createRule({
  type: 'maxLength',
  validator: (
    value: Maybe<string | Record<PropertyKey, any> | any[]>,
    count: number,
    options?: CommonComparisonOptions
  ) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value, false) && isFilled(count)) {
      if (isNumber(count)) {
        if (allowEqual) {
          return getSize(value) <= count;
        } else {
          return getSize(value) < count;
        }
      }
      console.warn(`[maxLength] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`);
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
