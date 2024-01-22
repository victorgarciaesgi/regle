import { ruleHelpers } from '../helpers';
import { createRule, defineType, RegleRuleWithParamsDefinition } from '@regle/core';

export const exactLength: RegleRuleWithParamsDefinition<
  string | Record<PropertyKey, any> | any[],
  [count: number]
> = createRule({
  type: defineType<string | Record<PropertyKey, any> | any[], [count: number]>('exactLength'),
  validator: (value, count) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
      if (ruleHelpers.isNumber(count)) {
        return ruleHelpers.size(value) === count;
      }
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${count}`);
      return false;
    }
    return true;
  },
  message: (_, { $params: [count] }) => {
    return `This field should be exactly ${count} characters long`;
  },
});
