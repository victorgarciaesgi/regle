import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Checks if the string ends with the specified substring.
 *
 * @param part - the value the field must end with
 */
export const endsWith: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean, string> =
  createRule({
    type: 'endsWith',
    validator(value: Maybe<string>, part: Maybe<string>) {
      if (isFilled(value) && isFilled(part)) {
        return value.endsWith(part);
      }
      return true;
    },
    message({ $params: [part] }) {
      return `The value must end with ${part}`;
    },
  });
