import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a value to be a native Date constructor
 *
 * Mainly used for typing
 */
export const date: RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<Date>, unknown> = createRule({
  type: 'date',
  validator: (value: MaybeInput<unknown>) => {
    if (isFilled(value)) {
      return value instanceof Date;
    }
    return true;
  },
  message: 'The value must be a native Date constructor',
});
