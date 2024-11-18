import { ruleHelpers } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';

export const maxLength: RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [count: number],
  false,
  boolean
> = createRule({
  type: 'maxLength',
  validator: (value: Maybe<string | Record<PropertyKey, any> | any[]>, count: number) => {
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
  message: (value, { $params: [count] }) => {
    if (Array.isArray(value)) {
      return `This list should have maximum ${count} items`;
    }
    return `The maximum length allowed is ${count}`;
  },
});
