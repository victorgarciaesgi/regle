import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Checks if the string contains the specified substring.
 *
 * @param part - the part the value needs to contain
 */
export const contains: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'contains',
  validator(value: MaybeInput<string>, part: MaybeInput<string>) {
    if (isFilled(value) && isFilled(part)) {
      return value.includes(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `The value must contain ${part}`;
  },
});
