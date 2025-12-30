import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';
import { isFile } from '../../../shared/utils/isFile';
import { formatFileSize } from '../../../shared';

/**
 * Requires a value to be a file with a minimum size.
 *
 * @param minSize - The minimum size of the file
 *
 * @example
 * ```ts
 * import { type InferInput } from '@regle/core';
 * import { minFileSize } from '@regle/rules';
 *
 * const {r$} = useRegle({ file: null as File | null }, {
 *   file: { minFileSize: minFileSize(1_000_000) }, // 1 MB
 * })
 *
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#minfilesize Documentation}
 */
export const minFileSize: RegleRuleWithParamsDefinition<
  File,
  [minSize: number],
  false,
  | true
  | {
      $valid: boolean;
      fileSize: number;
    },
  unknown,
  File
> = createRule({
  type: 'minFileSize',
  validator: (value: MaybeInput<File>, minSize: number) => {
    if (isFilled(value)) {
      if (isFile(value)) {
        return {
          $valid: value.size >= minSize,
          fileSize: value.size,
        };
      }
      return true;
    }
    return true;
  },
  message({ $params: [minSize], fileSize }) {
    return `File size (${formatFileSize(fileSize)}) must be at least ${formatFileSize(minSize)}`;
  },
});
