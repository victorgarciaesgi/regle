import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const numericRegex = /^\d*(\.\d+)?$/;

/**
 * Allows only numeric values (including numeric strings).
 */
export const numeric: RegleRuleDefinition<
  string | number,
  [],
  false,
  boolean,
  MaybeInput<string | number>
> = createRule({
  type: 'numeric',
  validator(value: MaybeInput<string | number>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, numericRegex);
  },
  message: 'The value must be numeric',
});
