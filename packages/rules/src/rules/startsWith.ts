import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Checks if the string starts with the specified substring.
 *
 * @param part - The substring the value must start with
 *
 * @example
 * ```ts
 * import { startsWith } from '@regle/rules';
 *
 * const { r$ } = useRegle({ bestLib: '' }, {
 *   bestLib: {
 *     startsWith: startsWith('regle')
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#startswith Documentation}
 */
export const startsWith: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'startsWith',
  validator(value: MaybeInput<string>, part: MaybeInput<string>) {
    if (isFilled(value) && isFilled(part)) {
      return value.startsWith(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `The value must start with ${part}`;
  },
});
