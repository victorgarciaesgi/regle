import { ruleHelpers } from '../helpers';
import { createRule, RegleRuleWithParamsDefinition } from '@regle/core';

export const between: RegleRuleWithParamsDefinition<number, [min: number, max: number]> =
  createRule<number, [min: number, max: number]>({
    validator: (value, min, max) => {
      if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(min) && ruleHelpers.isFilled(max)) {
        if (ruleHelpers.isNumber(value) && ruleHelpers.isNumber(min) && ruleHelpers.isNumber(max)) {
          return value >= min && value <= max;
        }
        console.warn(
          `[between] Value or parameters aren't a number, got value: ${value}, min: ${min}, max: ${max}`
        );
        return true;
      }
      return true;
    },
    message: (_, min, max) => {
      return `Value must be between ${min} and ${max}`;
    },
    type: 'between',
  });
