import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const requiredIf: RegleRuleWithParamsDefinition<unknown, [condition: boolean], false, boolean> = createRule({
  type: 'required',
  validator(value: unknown, condition: boolean) {
    if (condition) {
      return ruleHelpers.isFilled(value);
    }
    return true;
  },
  message: 'This field is required',
  active({ $params: [condition] }) {
    return condition;
  },
});
