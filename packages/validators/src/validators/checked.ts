import type { RegleRuleDefinition } from '@regle/core';
import { createRule, defineType } from '@regle/core';
import { ruleHelpers } from '../helpers';

export const checked: RegleRuleDefinition<boolean, [], false, boolean, boolean> = createRule({
  type: defineType<boolean>('checked'),
  validator: (value) => {
    return value === true;
  },
  message: 'This field must be checked',
});
