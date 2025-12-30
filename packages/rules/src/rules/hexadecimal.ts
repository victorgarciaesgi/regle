import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { matchRegex, isEmpty } from '../helpers';
import { HEX_REGEX } from '../utils/regexes';

/**
 * Validates hexadecimal values.
 *
 * @example
 * ```ts
 * import { hexadecimal } from '@regle/rules';
 *
 * const { r$ } = useRegle({ hexadecimal: '' }, {
 *   hexadecimal: { hexadecimal },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#hexadecimal Documentation}
 */
export const hexadecimal: RegleRuleDefinition<string, [], false, boolean, MaybeInput<string>> = createRule({
  type: 'hexadecimal',
  validator(value: MaybeInput<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, HEX_REGEX);
  },
  message: 'The value must be hexadecimal',
});
