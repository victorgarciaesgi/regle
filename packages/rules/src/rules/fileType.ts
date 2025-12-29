import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';
import { isFile } from '../../../shared/utils/isFile';

/**
 * Requires a value to be a file with a specific type.
 *
 * @example
 * ```ts
 * import { type InferInput } from '@regle/core';
 * import { fileType } from '@regle/rules';
 *
 * const {r$} = useRegle({ file: null as File | null }, {
 *   file: { fileType: fileType(['image/png', 'image/jpeg']) },
 * })
 *
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#file Documentation}
 */
export const fileType: RegleRuleWithParamsDefinition<
  unknown,
  [accept: string[]],
  false,
  boolean,
  MaybeInput<File>,
  unknown
> = createRule({
  type: 'fileType',
  validator: (value: MaybeInput<unknown>, accept: string[]) => {
    if (isFilled(value)) {
      if (isFile(value)) {
        return accept.includes(value.type);
      }
      return false;
    }
    return true;
  },
  message({ $params: [accept] }) {
    const filteredAccept = accept.map((type) => type.split('/')[1]).join(', ');
    return `File type is not allowed. Allowed types are: ${filteredAccept}.`;
  },
});
