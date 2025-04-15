import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';

const alphaRegex = /^[a-zA-Z]*$/;
const alphaSymbolRegex = /^[\w.]+$/;

/**
 * Allows only alphabetic characters.
 * */
export const alpha: RegleRuleWithParamsDefinition<
  string,
  [allowSymbols?: boolean | undefined],
  false,
  boolean,
  string
> = createRule({
  type: 'alpha',
  validator(value: Maybe<string>, allowSymbols?: boolean) {
    if (isEmpty(value)) {
      return true;
    }
    if (allowSymbols) {
      return matchRegex(value, alphaSymbolRegex);
    }
    return matchRegex(value, alphaRegex);
  },
  message: 'The value is not alphabetical',
});
