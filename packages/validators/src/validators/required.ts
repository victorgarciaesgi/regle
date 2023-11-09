import { RegleRuleDefinition, createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const required: RegleRuleDefinition<unknown> = createRule<unknown>({
  validator: (value) => {
    return ruleHelpers.isFilled(typeof value === 'string' ? value.trim() : value);
  },
  message: 'Value is required',
  type: 'required',
});
