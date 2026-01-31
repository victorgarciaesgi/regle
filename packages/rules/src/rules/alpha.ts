import type { MaybeInput, RegleRuleWithParamsDefinition, CommonAlphaOptions } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { ALPHA_REGEX, ALPHA_SYMBOL_REGEX } from '../utils/regexes';

/**
 * Allows only alphabetic characters.
 *
 * @param options - Optional configuration for alpha validation
 * @param options.allowSymbols - Optional flag to allow symbols (_) in the alpha string
 *
 * @example
 * ```ts
 * import { alpha } from '@regle/rules';
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     alpha,
 *     // or with symbols allowed
 *     alpha: alpha({ allowSymbols: true }),
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#alpha Documentation}
 */
export const alpha: RegleRuleWithParamsDefinition<
  'alpha',
  string,
  [options?: CommonAlphaOptions | undefined],
  false,
  boolean,
  MaybeInput<string>,
  string
> = createRule({
  type: 'alpha',
  validator(value: MaybeInput<string>, options?: CommonAlphaOptions) {
    if (isEmpty(value)) {
      return true;
    }
    if (options?.allowSymbols) {
      return matchRegex(value, ALPHA_SYMBOL_REGEX);
    }
    return matchRegex(value, ALPHA_REGEX);
  },
  message: 'The value must be alphabetical',
});
