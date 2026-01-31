import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a value to be a native string type.
 *
 * Mainly used for typing with `InferInput`.
 *
 * @example
 * ```ts
 * import { type InferInput } from '@regle/core';
 * import { string } from '@regle/rules';
 *
 * const rules = {
 *   firstName: { string },
 * }
 *
 * const state = ref<InferInput<typeof rules>>({});
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#string Documentation}
 */
export const string: RegleRuleDefinition<
  'string',
  unknown,
  [],
  false,
  boolean,
  MaybeInput<string>,
  unknown
> = createRule({
  type: 'string',
  validator: (value: MaybeInput<unknown>) => {
    if (isFilled(value)) {
      return typeof value === 'string';
    }
    return true;
  },
  message: 'The value must be a string',
});
