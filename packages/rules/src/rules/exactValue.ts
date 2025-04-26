import { isFilled, isNumber, toNumber } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';

/**
 * Requires a field to have a strict numeric value.
 */
export const exactValue: RegleRuleWithParamsDefinition<number, [count: number], false, boolean, number> = createRule({
  type: 'exactValue',
  validator: (value: Maybe<number>, count: number) => {
    if (isFilled(value) && isFilled(count)) {
      if (isNumber(count) && !isNaN(toNumber(value))) {
        return toNumber(value) === count;
      }
      console.warn(`[exactValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`);
      return true;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `The value must be equal to ${count}`;
  },
});
