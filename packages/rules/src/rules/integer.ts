import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { INTEGER_REGEX } from '../utils/regexes';

/**
 * Allows only integers (positive and negative).
 *
 * @example
 * ```ts
 * import { integer } from '@regle/rules';
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: { integer },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#integer Documentation}
 */
export const integer: RegleRuleDefinition<string | number, [], false, boolean, MaybeInput<number>> = createRule({
  type: 'integer',
  validator(value: MaybeInput<number | string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, INTEGER_REGEX);
  },
  message: 'The value must be an integer',
});
