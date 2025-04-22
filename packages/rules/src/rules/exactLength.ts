import { isFilled, isNumber, getSize } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';

/**
 * Requires the input value to have a strict specified length, inclusive. Works with arrays, objects and strings.
 *
 * @param count - the required length
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
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${count}`);
      return false;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `The value should be exactly ${count} characters long`;
  },
});
