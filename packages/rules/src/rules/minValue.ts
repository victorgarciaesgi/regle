import { isFilled, isNumber, toNumber } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';

/**
 * Requires a field to have a specified minimum numeric value.
 *
 * @param count - the minimum count
 */
export const minValue: RegleRuleWithParamsDefinition<number, [count: number], false, boolean> = createRule({
  type: 'minValue',
  validator: (value: Maybe<number>, count: number) => {
    if (isFilled(value) && isFilled(count)) {
      if (isNumber(count) && !isNaN(toNumber(value))) {
        return toNumber(value) >= count;
      }
      console.warn(`[minValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`);
      return true;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `The minimum value allowed is ${count}`;
  },
});
