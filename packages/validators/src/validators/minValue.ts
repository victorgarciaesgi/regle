import { ruleHelpers } from '../helpers';
import { createRule, RegleRuleWithParamsDefinition } from '@regle/core';

export const minValue: RegleRuleWithParamsDefinition<number, [count: number]> = createRule<
  number,
  [count: number]
>({
  validator: (value, count) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
      if (ruleHelpers.isNumber(count) && ruleHelpers.isNumber(value)) {
        return value >= count;
      }
      console.warn(
        `[minValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`
      );
      return true;
    }
    return true;
  },
  message: (_, count) => {
    return `Value must be minimum ${count}`;
  },
  type: 'minValue',
});