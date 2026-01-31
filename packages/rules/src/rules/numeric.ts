import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { NUMERIC_REGEX } from '../utils/regexes';

/**
 * Allows only numeric values (including numeric strings).
 *
 * @example
 * ```ts
 * import { numeric } from '@regle/rules';
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: { numeric },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#numeric Documentation}
 */
export const numeric: RegleRuleDefinition<
  'numeric',
  string | number,
  [],
  false,
  boolean,
  MaybeInput<string | number>
> = createRule({
  type: 'numeric',
  validator(value: MaybeInput<string | number>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, NUMERIC_REGEX);
  },
  message: 'The value must be numeric',
});
