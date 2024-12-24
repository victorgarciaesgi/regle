import type { RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

export const required: RegleRuleDefinition<unknown, [], false, boolean, unknown> = createRule({
  type: 'required',
  validator: (value: unknown) => {
    return isFilled(value);
  },
  message: 'This field is required',
});
