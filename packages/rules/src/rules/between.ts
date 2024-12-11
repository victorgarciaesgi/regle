import { ruleHelpers } from '../helpers';
import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';

export const between: RegleRuleWithParamsDefinition<number, [min: number, max: number], false, boolean> = createRule({
  type: 'between',
  validator: (value: Maybe<number>, min: number, max: number) => {
    if (ruleHelpers.isFilled(value) && ruleHelpers.isFilled(min) && ruleHelpers.isFilled(max)) {
      const tValue = ruleHelpers.toNumber(value);
      const tMin = ruleHelpers.toNumber(min);
      const tMax = ruleHelpers.toNumber(max);
      if (ruleHelpers.isNumber(tValue) && ruleHelpers.isNumber(tMin) && ruleHelpers.isNumber(tMax)) {
        return tValue >= tMin && tValue <= tMax;
      }
      console.warn(`[between] Value or parameters aren't numbers, got value: ${value}, min: ${min}, max: ${max}`);
      return false;
    }
    return true;
  },
  message: ({ $params: [min, max] }) => {
    return `The value must be between ${min} and ${max}`;
  },
});
