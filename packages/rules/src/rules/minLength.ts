import { isFilled, isNumber, getSize } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';

/**
 * Requires the input value to have a minimum specified length, inclusive. Works with arrays, objects and strings.
 *
 * @param min - the minimum value
 */
export const minLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [count: number],
  false,
  boolean
> = createRule({
  type: 'minLength',
  validator: (value: Maybe<string | Record<PropertyKey, any> | any[]>, count: number) => {
    if (isFilled(value, false) && isFilled(count)) {
      if (isNumber(count)) {
        return getSize(value) >= count;
      }
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${count}`);
      return false;
    }
    return true;
  },
  message: ({ $value, $params: [count] }) => {
    if (Array.isArray($value)) {
      return `This list should have at least ${count} items`;
    }
    return `This field should be at least ${count} characters long`;
  },
});
