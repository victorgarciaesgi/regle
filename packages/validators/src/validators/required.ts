import { RegleRuleDefinition, createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const required: RegleRuleDefinition<unknown> = createRule({
  type: defineType<unknown>('required'),
  validator: (value) => {
    return ruleHelpers.isFilled(typeof value === 'string' ? value.trim() : value);
  },
  message: 'Value is required',
});
