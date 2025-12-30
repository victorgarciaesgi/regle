import { createRule, type Maybe, type RegleRuleDefinition } from '@regle/core';
import { isEmpty } from '../helpers';
import { EMOJI_REGEX } from '../utils/regexes';

/**
 * Validates if the value is a valid emoji.
 *
 * @example
 * ```ts
 * import { emoji } from '@regle/rules';
 *
 * const { r$ } = useRegle({ emoji: '' }, {
 *   emoji: { emoji },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#emoji Documentation}
 */
export const emoji: RegleRuleDefinition<string, [], false, boolean, unknown, string> = createRule({
  type: 'emoji',
  validator(value: Maybe<string>) {
    if (isEmpty(value)) {
      return true;
    }
    return EMOJI_REGEX().test(value);
  },
  message: 'The value should be a valid emoji',
});
