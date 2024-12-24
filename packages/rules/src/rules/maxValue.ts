import { isFilled, isNumber, toNumber } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';

export const maxValue: RegleRuleWithParamsDefinition<number, [count: number], false, boolean> = createRule({
  type: 'maxValue',
  validator: (value: Maybe<number>, count: number) => {
    if (isFilled(value) && isFilled(count)) {
      if (isNumber(count) && !isNaN(toNumber(value))) {
        return toNumber(value) <= count;
      }
      console.warn(`[maxValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`);
      return true;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `The maximum value allowed is ${count}`;
  },
});
