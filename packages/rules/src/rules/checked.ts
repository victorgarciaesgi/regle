import type { Maybe, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';

export const checked: RegleRuleDefinition<boolean, [], false, boolean, boolean> = createRule({
  type: 'checked',
  validator: (value: Maybe<boolean>) => {
    return value === true;
  },
  message: 'This field must be checked',
});
