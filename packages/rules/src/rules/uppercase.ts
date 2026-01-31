import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { UPPERCASE_REGEX } from '../utils/regexes';

/**
 * Validates uppercase strings.
 *
 * @example
 * ```ts
 * import { uppercase } from '@regle/rules';
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: { uppercase },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#uppercase Documentation}
 */
export const uppercase: RegleRuleDefinition<'uppercase', string, [], false, boolean, unknown, string> = createRule({
  type: 'uppercase',
  validator(value: MaybeInput<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, UPPERCASE_REGEX);
  },
  message: 'The value must be uppercase',
});
