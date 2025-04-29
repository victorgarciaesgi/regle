import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Checks if the string starts with the specified substring.
 *
 * @private part - the value the field must start with
 */
export const startsWith: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean> = createRule({
  type: 'startsWith',
  validator(value: Maybe<string>, part: Maybe<string>) {
    if (isFilled(value) && isFilled(part)) {
      return value.startsWith(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `The value must end with ${part}`;
  },
});
