import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { HOSTNAME_REGEX } from '../utils/regexes';

/**
 * Validates hostnames.
 *
 * @example
 * ```ts
 * import { hostname } from '@regle/rules';
 *
 * const { r$ } = useRegle({ siteHost: '' }, {
 *   siteHost: { hostname },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#hostname Documentation}
 */
export const hostname: RegleRuleDefinition<string, [], false, boolean, unknown, string> = createRule({
  type: 'hostname',
  validator(value: MaybeInput<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, HOSTNAME_REGEX);
  },
  message: 'The value is not a valid hostname',
});
