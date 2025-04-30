import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { matchRegex, isEmpty } from '../helpers';

const decimalRegex = /^[-]?\d*(\.\d+)?$/;

/**
 * Allows positive and negative decimal numbers.
 */
export const decimal: RegleRuleDefinition<string | number, [], false, boolean, number> = createRule({
  type: 'decimal',
  validator(value: Maybe<number | string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, decimalRegex);
  },
  message: 'The value must be decimal',
});
