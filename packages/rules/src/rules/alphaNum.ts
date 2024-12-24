import type { RegleRuleDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const alphaNumRegex = /^[a-zA-Z0-9]*$/;

export const alphaNum: RegleRuleDefinition<string | number, [], false, boolean, string | number> = createRule({
  type: 'alpha',
  validator(value: Maybe<string | number>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, alphaNumRegex);
  },
  message: 'The value must be alpha-numeric',
});
