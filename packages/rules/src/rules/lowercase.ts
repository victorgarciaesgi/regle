import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { LOWERCASE_REGEX } from '../utils/regexes';

/**
 * Validates lowercase strings.
 *
 * @example
 * ```ts
 * import { lowercase } from '@regle/rules';
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: { lowercase },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#lowercase Documentation}
 */
export const lowercase: RegleRuleDefinition<string, [], false, boolean, unknown, string> = createRule({
  type: 'lowercase',
  validator(value: MaybeInput<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, LOWERCASE_REGEX);
  },
  message: 'The value must be lowercase',
});
