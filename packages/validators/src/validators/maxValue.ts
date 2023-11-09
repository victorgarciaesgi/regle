import { ruleHelpers } from '../helpers';
import { createRule, RegleRuleWithParamsDefinition } from '@regle/core';

export const maxValue: RegleRuleWithParamsDefinition<number, [count: number]> = createRule<
  number,
  [count: number]
>({
  validator: (value, count) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
      if (ruleHelpers.isNumber(count) && ruleHelpers.isNumber(value)) {
        return value <= count;
      }
      console.warn(
        `[maxValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`
      );
      return true;
    }
    return true;
  },
  message: (_, count) => {
    return `The maximum value allowed is ${count}`;
  },
  type: 'maxValue',
});
