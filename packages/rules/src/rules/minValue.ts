import { isFilled, isNumber, toNumber } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import type { CommonComparationOptions } from '@regle/core';

/**
 * Requires a field to have a specified minimum numeric value.
 *
 * @param count - the minimum count
 */
export const minValue: RegleRuleWithParamsDefinition<
  number,
  [count: number, options?: CommonComparationOptions],
  false,
  boolean
> = createRule({
  type: 'minValue',
  validator: (value: Maybe<number>, count: number, options?: CommonComparationOptions) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value) && isFilled(count)) {
      if (isNumber(count) && !isNaN(toNumber(value))) {
        if (allowEqual) {
          return toNumber(value) >= count;
        } else {
          return toNumber(value) > count;
        }
      }
      console.warn(`[minValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`);
      return true;
    }
    return true;
  },
  message: ({ $params: [count, options] }) => {
    const { allowEqual = true } = options ?? {};
    if (allowEqual) {
      return `Value must be greater than or equal to ${count}`;
    } else {
      return `Value must be greater than ${count}`;
    }
  },
});
