import { ruleHelpers } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';

export const maxValue: RegleRuleWithParamsDefinition<number, [count: number], false, boolean> =
  createRule({
    type: 'maxValue',
    validator: (value: Maybe<number>, count: number) => {
      if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(count)) {
        if (ruleHelpers.isNumber(count) && ruleHelpers.isNumber(value)) {
          return value <= count;
        }
        console.warn(
          `[maxValue] Value or parameter isn't a number, got value: ${value}, parameter: ${count}`
        );
        return false;
      }
      return true;
    },
    message: (_, { $params: [count] }) => {
      return `The maximum value allowed is ${count}`;
    },
  });
