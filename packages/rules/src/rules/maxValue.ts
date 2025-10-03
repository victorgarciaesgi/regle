import type { CommonComparisonOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, toNumber } from '../helpers';

/**
 * Requires a field to have a specified maximum numeric value.
 *
 * @param max - the maximum value
 * @param options - comparison options
 */
export const maxValue: RegleRuleWithParamsDefinition<
  number | string,
  [count: number | string, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<number | string>
> = createRule({
  type: 'maxValue',
  validator: (value: MaybeInput<number | string>, count: number | string, options?: CommonComparisonOptions) => {
    const { allowEqual = true } = options ?? {};
    if (isFilled(value) && isFilled(count)) {
      if (!isNaN(toNumber(value)) && !isNaN(toNumber(count))) {
        if (allowEqual) {
          return toNumber(value) <= toNumber(count);
        } else {
          return toNumber(value) < toNumber(count);
        }
      }
      console.warn(`[maxValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`);
      return false;
    }
    return true;
  },
  message: ({ $params: [count, options] }) => {
    const { allowEqual = true } = options ?? {};
    if (allowEqual) {
      return `The value must be less than or equal to ${count}`;
    } else {
      return `The value must be less than ${count}`;
    }
  },
});
