import type { RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const required: RegleRuleDefinition<unknown, [], false, boolean, unknown> = createRule({
  type: 'required',
  validator: (value: unknown) => {
    return ruleHelpers.isFilled(value);
  },
  message: 'This field is required',
});
