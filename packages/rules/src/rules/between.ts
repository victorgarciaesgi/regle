import { isFilled, toNumber, isNumber } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';

/**
 * Checks if a number is in specified bounds. min and max are both inclusive.
 *
 * @param min - the minimum limit
 * @param max - the maximum limit
 */
export const between: RegleRuleWithParamsDefinition<
  number,
  [min: number, max: number, options?: CommonComparisonOptions],
  false,
  boolean,
  number
> = createRule({
  type: 'between',
  validator: (value: Maybe<number>, min: number, max: number, options?: CommonComparisonOptions) => {
    const { allowEqual = true } = options ?? {};

    if (isFilled(value) && isFilled(min) && isFilled(max)) {
      const tValue = toNumber(value);
      const tMin = toNumber(min);
      const tMax = toNumber(max);
      if (isNumber(tValue) && isNumber(tMin) && isNumber(tMax)) {
        if (allowEqual) {
          return tValue >= tMin && tValue <= tMax;
        } else {
          return tValue > tMin && tValue < tMax;
        }
      }
      console.warn(`[between] Value or parameters aren't numbers, got value: ${value}, min: ${min}, max: ${max}`);
      return false;
    }
    return true;
  },
  message: ({ $params: [min, max] }) => {
    return `The value must be between ${min} and ${max}`;
  },
});
