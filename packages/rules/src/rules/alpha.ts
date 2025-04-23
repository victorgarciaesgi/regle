import type { Maybe, RegleRuleWithParamsDefinition, CommonAlphaOptions } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const alphaRegex = /^[a-zA-Z]*$/;
const alphaSymbolRegex = /^[\w.]+$/;

/**
 * Allows only alphabetic characters.
 *
 * @param [options] - Alpha rules options
 * */
export const alpha: RegleRuleWithParamsDefinition<
  string,
  [options?: CommonAlphaOptions | undefined],
  false,
  boolean,
  string
> = createRule({
  type: 'alpha',
  validator(value: Maybe<string>, options?: CommonAlphaOptions) {
    if (isEmpty(value)) {
      return true;
    }
    if (options?.allowSymbols) {
      return matchRegex(value, alphaSymbolRegex);
    }
    return matchRegex(value, alphaRegex);
  },
  message: 'The value is not alphabetical',
});
