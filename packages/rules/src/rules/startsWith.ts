import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Checks if the string starts with the specified substring.
 *
 * @private part - the value the field must start with
 */
export const startsWith: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'startsWith',
  validator(value: MaybeInput<string>, part: MaybeInput<string>) {
    if (isFilled(value) && isFilled(part)) {
      return value.startsWith(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `The value must start with ${part}`;
  },
});
