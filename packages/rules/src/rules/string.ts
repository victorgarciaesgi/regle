import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a value to be a native string type
 *
 * Mainly used for typing
 */
export const string: RegleRuleDefinition<unknown, [], false, boolean, MaybeInput<string>, unknown> = createRule({
  type: 'string',
  validator: (value: MaybeInput<unknown>) => {
    if (isFilled(value)) {
      return typeof value === 'string';
    }
    return true;
  },
  message: 'The value must be a string',
});
