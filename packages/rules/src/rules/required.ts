import type { RegleRuleDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const required: RegleRuleDefinition<unknown, [], false, boolean, unknown> = createRule({
  type: defineType<unknown>('required'),
  validator: (value) => {
    return ruleHelpers.isFilled(value);
  },
  message: 'This field is required',
});
