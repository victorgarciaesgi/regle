import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const alphaRegex = /^[a-zA-Z]*$/;

/**
 * Allows only alphabetic characters.
 * */
export const alpha: RegleRuleDefinition<string, [], false, boolean, string> = createRule({
  type: 'alpha',
  validator(value: Maybe<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, alphaRegex);
  },
  message: 'The value is not alphabetical',
});
