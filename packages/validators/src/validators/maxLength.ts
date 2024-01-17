import { ruleHelpers } from '../helpers';
import { createRule, defineType, RegleRuleWithParamsDefinition } from '@regle/core';

export const maxLength: RegleRuleWithParamsDefinition<
  string | Record<PropertyKey, any> | any[],
  [count: number]
> = createRule({
  type: defineType<string | Record<PropertyKey, any> | any[], [count: number]>('maxLength'),
  validator: (value, count) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
      if (ruleHelpers.isNumber(count)) {
        return ruleHelpers.size(value) <= count;
      }
      console.warn(
        `[maxLength] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`
      );
      return false;
    }
    return true;
  },
  message: (_, { $params: [count] }) => {
    return `The maximum length allowed is ${count}`;
  },
});
