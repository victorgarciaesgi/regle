import type { Maybe, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a boolean value to be true. This is useful for checkbox inputs.
 */
export const checked: RegleRuleDefinition<boolean, [], false, boolean, boolean> = createRule({
  type: 'checked',
  validator: (value: Maybe<boolean>) => {
    if (isFilled(value)) {
      return value === true;
    }
    return true;
  },
  message: 'The field must be checked',
});
