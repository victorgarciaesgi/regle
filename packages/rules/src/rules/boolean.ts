import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires a value to be a native boolean type.
 *
 * Mainly used for typing with `InferInput`.
 *
 * @example
 * ```ts
 * import { type InferInput } from '@regle/core';
 * import { boolean } from '@regle/rules';
 *
 * const rules = {
 *   checkbox: { boolean },
 * }
 *
 * const state = ref<InferInput<typeof rules>>({});
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#boolean Documentation}
 */
export const boolean: RegleRuleDefinition<
  'boolean',
  unknown,
  [],
  false,
  boolean,
  MaybeInput<boolean>,
  unknown
> = createRule({
  type: 'boolean',
  validator: (value: MaybeInput<unknown>) => {
    if (isFilled(value)) {
      return typeof value === 'boolean';
    }
    return true;
  },
  message: 'The value must be a native boolean',
});
