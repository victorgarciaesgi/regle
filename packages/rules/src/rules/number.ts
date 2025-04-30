import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, isNumber } from '../helpers';

/**
 * Requires a value to be a native number type
 *
 * Mainly used for typing
 */
export const number: RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<number>, unknown> = createRule({
  type: 'number',
  validator: (value: MaybeInput<unknown>) => {
    if (isFilled(value)) {
      return isNumber(value);
    }
    return true;
  },
  message: 'The value must be a native number',
});
