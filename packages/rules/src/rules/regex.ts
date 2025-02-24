import type { Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, matchRegex } from '../helpers';

/**
 * Checks if the value matches one or more regular expressions.
 */
export const regex: RegleRuleWithParamsDefinition<string | number, [regexp: RegExp | RegExp[]], false, boolean> =
  createRule({
    type: 'regex',
    validator(value: Maybe<string | number>, regexp: RegExp | RegExp[]) {
      if (isFilled(value)) {
        const filteredRegxp = Array.isArray(regexp) ? regexp : [regexp];
        return matchRegex(value, ...filteredRegxp);
      }
      return true;
    },
    message: 'This field does not match the required pattern',
  });
