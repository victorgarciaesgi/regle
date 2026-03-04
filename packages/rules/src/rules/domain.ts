import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { DOMAIN_REGEX } from '../utils/regexes';

/**
 * Validates domain names.
 *
 * @example
 * ```ts
 * import { domain } from '@regle/rules';
 *
 * const { r$ } = useRegle({ siteDomain: '' }, {
 *   siteDomain: { domain },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#domain Documentation}
 */
export const domain: RegleRuleDefinition<'domain', string, [], false, boolean, unknown, string> = createRule({
  type: 'domain',
  validator(value: MaybeInput<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, DOMAIN_REGEX);
  },
  message: 'The value is not a valid domain',
});
