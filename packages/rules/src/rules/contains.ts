import type { RegleRuleWithParamsDefinition, Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Checks if the string contains the specified substring.
 *
 * @param part - the part the value needs to contain
 */
export const contains: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean> = createRule({
  type: 'contains',
  validator(value: Maybe<string>, part: Maybe<string>) {
    if (isFilled(value) && isFilled(part)) {
      return value.includes(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `Field must contain ${part}`;
  },
});
