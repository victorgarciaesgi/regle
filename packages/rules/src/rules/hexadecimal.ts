import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { matchRegex, isEmpty } from '../helpers';

const hexadecimalRegex = /^[a-fA-F0-9]*$/;

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
    return matchRegex(value, hexadecimalRegex);
  },
  message: 'The value must be hexadecimal',
});
