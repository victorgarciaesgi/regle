import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';
import { isFile } from '../../../shared/utils/isFile';
import { formatFileSize } from '../../../shared';

/**
 * Requires a value to be a file with a maximum size.
 *
 * @param maxSize - The maximum size of the file
 *
 * @example
 * ```ts
 * import { type InferInput } from '@regle/core';
 * import { maxFileSize } from '@regle/rules';
 *
 * const {r$} = useRegle({ file: null as File | null }, {
 *   file: { maxFileSize: maxFileSize(10_000_000) }, // 10 MB
 * })
 *
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#maxfilesize Documentation}
 */
export const maxFileSize: RegleRuleWithParamsDefinition<
  'maxFileSize',
  File,
  [maxSize: number],
  false,
  | true
  | {
      $valid: boolean;
      fileSize: number;
    },
  unknown,
  File
> = createRule({
  type: 'maxFileSize',
  validator: (value: MaybeInput<File>, maxSize: number) => {
    if (isFilled(value)) {
      if (isFile(value)) {
        return {
          $valid: value.size <= maxSize,
          fileSize: value.size,
        };
      }
      return true;
    }
    return true;
  },
  message({ $params: [maxSize], fileSize }) {
    return `File size (${formatFileSize(fileSize)}) cannot exceed ${formatFileSize(maxSize)}`;
  },
});
