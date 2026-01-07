import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';
import { isString } from '../helpers/ruleHelpers';

/**
 * Checks if the string ends with the specified substring.
 *
 * @param part - The substring the value must end with
 *
 * @example
 * ```ts
 * import { endsWith } from '@regle/rules';
 *
 * const { r$ } = useRegle({ firstName: '' }, {
 *   firstName: { endsWith: endsWith('foo') },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#endswith Documentation}
 */
export const endsWith: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'endsWith',
  validator(value: MaybeInput<string>, part: MaybeInput<string>) {
    if (isFilled(value) && isFilled(part) && isString(value) && isString(part)) {
      return value.endsWith(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `The value must end with ${part}`;
  },
});
