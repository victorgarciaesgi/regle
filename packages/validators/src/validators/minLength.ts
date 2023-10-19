import { ruleHelpers } from '../helpers';
import { createRule, RegleRuleWithParamsDefinition } from '@regle/core';

export const minLength: RegleRuleWithParamsDefinition<
  string | Record<PropertyKey, any> | any[],
  [count: number]
> = createRule<string | Record<PropertyKey, any> | any[], [count: number]>({
  validator: (value, count) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
      if (ruleHelpers.isNumber(count)) {
        return ruleHelpers.size(value) >= count;
      }
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${count}`);
      return true;
    }
    return true;
  },
  message: (_, count) => {
    return `Value must be minimum ${count} characters long`;
  },
  type: 'minLength',
});
