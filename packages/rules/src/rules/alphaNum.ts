import type { CommonAlphaOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const alphaNumRegex = /^[a-zA-Z0-9]*$/;
const alphaNumSymbolRegex = /^[a-zA-Z0-9_]*$/;

/**
 * Allows only alphanumeric characters.
 *
 * @param [options] - Alpha rules options
 */
export const alphaNum: RegleRuleWithParamsDefinition<
  string | number,
  [options?: CommonAlphaOptions | undefined],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'alphaNum',
  validator(value: MaybeInput<string | number>, options?: CommonAlphaOptions) {
    if (isEmpty(value)) {
      return true;
    }
    if (options?.allowSymbols) {
      return matchRegex(value, alphaNumSymbolRegex);
    }
    return matchRegex(value, alphaNumRegex);
  },
  message: 'The value must be alpha-numeric',
});
