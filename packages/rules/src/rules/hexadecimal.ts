import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { matchRegex, isEmpty } from '../helpers';

const hexadecimalRegex = /^[a-fA-F0-9]*$/;

/**
 * Allows only hexadecimal values.
 */
export const hexadecimal: RegleRuleDefinition<string, [], false, boolean, string> = createRule({
  type: 'hexadecimal',
  validator(value: Maybe<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, hexadecimalRegex);
  },
  message: 'The value must be hexadecimal',
});
