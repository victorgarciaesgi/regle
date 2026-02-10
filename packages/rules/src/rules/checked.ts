import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';

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
export const checked: RegleRuleDefinition<
  'checked',
  boolean,
  [],
  false,
  boolean,
  MaybeInput<boolean>,
  boolean,
  true
> = createRule({
  type: 'checked',
  validator: (value: MaybeInput<boolean>) => {
    return value === true;
  },
  message: 'The field must be checked',
  required: true,
});
