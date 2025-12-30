import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { EMAIL_REGEX } from '../utils/regexes';

/**
 * Validates email addresses. Always verify on the server to ensure the address is real and not already in use.
 *
 * @example
 * ```ts
 * import { email } from '@regle/rules';
 *
 * const { r$ } = useRegle({ email: '' }, {
 *   email: { email },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#email Documentation}
 */
export const email: RegleRuleDefinition<string, [], false, boolean, MaybeInput<string>> = createRule({
  type: 'email',
  validator(value: MaybeInput<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, EMAIL_REGEX);
  },
  message: 'The value must be an valid email address',
});
