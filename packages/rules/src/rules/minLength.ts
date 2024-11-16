import { ruleHelpers } from '../helpers';
import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';

export const minLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [count: number],
  false,
  boolean
> = createRule({
  type: defineType<string | Record<PropertyKey, any> | any[], [count: number]>('minLength'),
  validator: (value, count) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
      if (ruleHelpers.isNumber(count)) {
        return ruleHelpers.size(value) >= count;
      }
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${count}`);
      return false;
    }
    return true;
  },
  message: (value, { $params: [count] }) => {
    if (Array.isArray(value)) {
      return `This list should have at least ${count} items`;
    }
    return `This field should be at least ${count} characters long`;
  },
});
