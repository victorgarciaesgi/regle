import { ruleHelpers } from '../helpers';
import { createRule, RegleRuleWithParamsDefinition } from '@regle/core';

export const between: RegleRuleWithParamsDefinition<number, [min: number, max: number]> =
  createRule<number, [min: number, max: number]>({
    validator: (value, min, max) => {
      if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(min) && ruleHelpers.isFilled(max)) {
        const tValue = ruleHelpers.toNumber(value);
        const tMin = ruleHelpers.toNumber(min);
        const tMax = ruleHelpers.toNumber(max);
        if (
          ruleHelpers.isNumber(tValue) &&
          ruleHelpers.isNumber(tMin) &&
          ruleHelpers.isNumber(tMax)
        ) {
          return tValue >= tMin && tValue <= tMax;
        }
        console.warn(
          `[between] Value or parameters aren't numbers, got value: ${value}, min: ${min}, max: ${max}`
        );
        return true;
      }
      return true;
    },
    message: (_, min, max) => {
      return `The value must be between ${min} and ${max}`;
    },
    type: 'between',
  });
