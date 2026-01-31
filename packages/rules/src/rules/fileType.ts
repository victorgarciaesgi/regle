import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';
import { isFile } from '../../../shared/utils/isFile';

/**
 * Requires a value to be a file with a specific type.
 *
 * @param accept - The allowed file types
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
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#filetype Documentation}
 */
export const fileType: RegleRuleWithParamsDefinition<
  'fileType',
  File,
  [accept: readonly string[]],
  false,
  boolean,
  unknown,
  File
> = createRule({
  type: 'fileType',
  validator: (value: MaybeInput<File>, accept: readonly string[]) => {
    if (isFilled(value)) {
      if (isFile(value)) {
        return accept.includes(value.type);
      }
      return true;
    }
    return true;
  },
  message({ $params: [accept] }) {
    const filteredAccept = accept.map((type) => type.split('/')[1]).join(', ');
    return `File type is not allowed. Allowed types are: ${filteredAccept}.`;
  },
});
