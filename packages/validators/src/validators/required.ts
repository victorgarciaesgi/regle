import { RegleRuleDefinition, createRule } from '@regle/core';
import { ruleHelpers } from 'helpers';

export const required: RegleRuleDefinition<unknown> = createRule<unknown>({
  validator: (value) => ruleHelpers.isFilled(value),
  message: 'Value is required',
  type: 'required',
});
