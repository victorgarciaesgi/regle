import type { CommonAlphaOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { ALPHA_NUM_REGEX, ALPHA_NUM_SYMBOL_REGEX } from '../utils/regexes';

/**
 * Allows only alphanumeric characters.
 *
 * @param options - Optional configuration for alphanumeric validation
 * @param options.allowSymbols - Optional flag to allow symbols (_) in the alphanumeric string
 *
 * @example
 * ```ts
 * import { alphaNum } from '@regle/rules';
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     alphaNum,
 *     // or with symbols allowed
 *     alphaNum: alphaNum({ allowSymbols: true }),
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#alphanum Documentation}
 */
export const alphaNum: RegleRuleWithParamsDefinition<
  string | number,
  [options?: CommonAlphaOptions | undefined],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'alphaNum',
  validator(value: MaybeInput<string | number>, options?: CommonAlphaOptions) {
    if (isEmpty(value)) {
      return true;
    }
    if (options?.allowSymbols) {
      return matchRegex(value, ALPHA_NUM_SYMBOL_REGEX);
    }
    return matchRegex(value, ALPHA_NUM_REGEX);
  },
  message: 'The value must be alpha-numeric',
});
