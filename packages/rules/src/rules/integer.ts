import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const integerRegex = /(^[0-9]*$)|(^-[0-9]+$)/;

/**
 * Allows only integers (positive and negative).
 */
export const integer: RegleRuleDefinition<string | number, [], false, boolean, number> = createRule({
  type: 'integer',
  validator(value: Maybe<number | string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, integerRegex);
  },
  message: 'The value must be an integer',
});
