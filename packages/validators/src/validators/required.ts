import { RegleRuleDefinition, createRule } from '@regle/core';

export const required: RegleRuleDefinition<unknown, []> = createRule<unknown>({
  validator: (value) => !!value,
  message: 'Value is required',
  type: 'required',
});
