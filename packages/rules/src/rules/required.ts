import type { RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires non-empty data. Checks for empty arrays and strings containing only whitespaces.
 *
 * @example
 * ```ts
 * import { required } from '@regle/rules';
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: { required },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#required Documentation}
 */
export const required: RegleRuleDefinition<'required', unknown, [], false, boolean, unknown, unknown, true> =
  createRule({
    type: 'required',
    validator: (value: unknown) => {
      return isFilled(value, true, false);
    },
    message: 'This field is required',
    required: true,
  });
