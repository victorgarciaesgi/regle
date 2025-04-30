import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, matchRegex } from '../helpers';

/**
 * Checks if the value matches one or more regular expressions.
 */
export const regex: RegleRuleWithParamsDefinition<
  string | number,
  [regexp: RegExp | RegExp[]],
  false,
  boolean,
  MaybeInput<string | number>
> = createRule({
  type: 'regex',
  validator(value: MaybeInput<string | number>, regexp: RegExp | RegExp[]) {
    if (isFilled(value)) {
      const filteredRegexp = Array.isArray(regexp) ? regexp : [regexp];
      return matchRegex(value, ...filteredRegexp);
    }
    return true;
  },
  message: 'The value does not match the required pattern',
});
