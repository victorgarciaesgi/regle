import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createStringOperationRule } from './common/createStringOperationRule';

/**
 * Checks if the string ends with the specified substring.
 *
 * @param part - The substring the value must end with
 *
 * @example
 * ```ts
 * import { endsWith } from '@regle/rules';
 *
 * const { r$ } = useRegle({ firstName: '' }, {
 *   firstName: { endsWith: endsWith('foo') },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#endswith Documentation}
 */
export const endsWith: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createStringOperationRule({
  type: 'endsWith',
  operation: 'endsWith',
});
