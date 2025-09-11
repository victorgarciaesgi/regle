import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a value to be a native boolean type
 *
 * Mainly used for typing
 */
export const boolean: RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<boolean>, unknown> = createRule({
  type: 'boolean',
  validator: (value: MaybeInput<unknown>) => {
    if (isFilled(value)) {
      return typeof value === 'boolean';
    }
    return true;
  },
  message: 'The value must be a native boolean',
});
