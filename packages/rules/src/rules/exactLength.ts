import { ruleHelpers } from '../helpers';
import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';

export const exactLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [count: number],
  false,
  boolean
> = createRule({
  type: 'exactLength',
  validator: (value: Maybe<string | Record<PropertyKey, any> | any[]>, count: number) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
      if (ruleHelpers.isNumber(count)) {
        return ruleHelpers.size(value) === count;
      }
      console.warn(`[minLength] Parameter isn't a number, got parameter: ${count}`);
      return false;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `This field should be exactly ${count} characters long`;
  },
});
