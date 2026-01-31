import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { matchRegex, isEmpty } from '../helpers';
import { DECIMAL_REGEX } from '../utils/regexes';

/**
 * Allows positive and negative decimal numbers.
 *
 * @example
 * ```ts
 * import { decimal } from '@regle/rules';
 *
 * const { r$ } = useRegle({ price: 0 }, {
 *   price: { decimal },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#decimal Documentation}
 */
export const decimal: RegleRuleDefinition<
  'decimal',
  string | number,
  [],
  false,
  boolean,
  MaybeInput<number | undefined>
> = createRule({
  type: 'decimal',
  validator(value: MaybeInput<number | string>) {
    if (isEmpty(value)) {
      return true;
    }
    return matchRegex(value, DECIMAL_REGEX);
  },
  message: 'The value must be decimal',
});
