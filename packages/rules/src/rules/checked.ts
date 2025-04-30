import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a boolean value to be true. This is useful for checkbox inputs.
 */
export const checked: RegleRuleDefinition<boolean, [], false, boolean, MaybeInput<boolean>> = createRule({
  type: 'checked',
  validator: (value: MaybeInput<boolean>) => {
    if (isFilled(value)) {
      return value === true;
    }
    return true;
  },
  message: 'The field must be checked',
});
