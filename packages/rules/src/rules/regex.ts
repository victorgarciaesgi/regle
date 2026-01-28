import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled, matchRegex } from '../helpers';

/**
 * Checks if the value matches one or more regular expressions.
 *
 * @param regexp - A single RegExp or an array of RegExp patterns
 *
 * @example
 * ```ts
 * import { regex } from '@regle/rules';
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     regex: regex(/^foo/),
 *     // or with multiple patterns
 *     regex: regex([/^bar/, /baz$/]),
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#regex Documentation}
 */
export const regex: RegleRuleWithParamsDefinition<
  string | number,
  [regexp: RegExp | RegExp[]],
  false,
  boolean,
  MaybeInput<string | number>
> = createRule({
  type: 'regex',
  validator(value: MaybeInput<string | number>, regexp: RegExp | RegExp[]) {
    if (isFilled(value)) {
      const filteredRegexp = Array.isArray(regexp) ? regexp : [regexp];
      return matchRegex(value, ...filteredRegexp);
    }
    return true;
  },
  message: 'The value must match the required pattern',
});
