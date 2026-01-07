import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';
import { isString } from '../helpers/ruleHelpers';

/**
 * Checks if the string contains the specified substring.
 *
 * @param part - The substring the value must contain
 *
 * @example
 * ```ts
 * import { contains } from '@regle/rules';
 *
 * const { r$ } = useRegle({ bestLib: '' }, {
 *   bestLib: {
 *     contains: contains('regle')
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#contains Documentation}
 */
export const contains: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createRule({
  type: 'contains',
  validator(value: MaybeInput<string>, part: MaybeInput<string>) {
    if (isFilled(value) && isFilled(part) && isString(value) && isString(part)) {
      return value.includes(part);
    }
    return true;
  },
  message({ $params: [part] }) {
    return `The value must contain ${part}`;
  },
});
