import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a boolean value to be `true`. This is useful for checkbox inputs like "accept terms".
 *
 * @example
 * ```ts
 * import { checked } from '@regle/rules';
 *
 * const { r$ } = useRegle({ confirm: false }, {
 *   confirm: { checked },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#checked Documentation}
 */
export const checked: RegleRuleDefinition<boolean, [], false, boolean, MaybeInput<boolean>, boolean, true> = createRule(
  {
    type: 'checked',
    validator: (value: MaybeInput<boolean>) => {
      if (isFilled(value)) {
        return value === true;
      }
      return true;
    },
    message: 'The field must be checked',
  }
);
