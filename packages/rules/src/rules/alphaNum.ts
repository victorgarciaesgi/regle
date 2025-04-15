import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const alphaNumRegex = /^[a-zA-Z0-9]*$/;
const alphaNumSymbolRegex = /^[a-zA-Z0-9_]*$/;

/**
 * Allows only alphanumeric characters.
 */
export const alphaNum: RegleRuleWithParamsDefinition<
  string | number,
  [allowSymbols?: boolean | undefined],
  false,
  boolean,
  string | number
> = createRule({
  type: 'alphaNum',
  validator(value: Maybe<string | number>, allowSymbols?: boolean) {
    if (isEmpty(value)) {
      return true;
    }
    if (allowSymbols) {
      return matchRegex(value, alphaNumSymbolRegex);
    }
    return matchRegex(value, alphaNumRegex);
  },
  message: 'The value must be alpha-numeric',
});
