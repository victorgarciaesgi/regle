import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';
import { isFile } from '../../../shared/utils/isFile';

/**
 * Requires a value to be a native `File` constructor.
 *
 * Mainly used for typing with `InferInput`.
 *
 * @example
 * ```ts
 * import { type InferInput } from '@regle/core';
 * import { file } from '@regle/rules';
 *
 * const rules = {
 *   file: { file },
 * }
 *
 * const state = ref<InferInput<typeof rules>>({});
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#file Documentation}
 */
export const file: RegleRuleDefinition<'file', unknown, [], false, boolean, MaybeInput<File>, unknown> = createRule({
  type: 'file',
  validator: (value: MaybeInput<unknown>) => {
    if (isFilled(value)) {
      return isFile(value);
    }
    return true;
  },
  message: 'The value must be a native File',
});
