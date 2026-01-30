import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createStringOperationRule } from './common/createStringOperationRule';

/**
 * Checks if the string starts with the specified substring.
 *
 * @param part - The substring the value must start with
 *
 * @example
 * ```ts
 * import { startsWith } from '@regle/rules';
 *
 * const { r$ } = useRegle({ bestLib: '' }, {
 *   bestLib: {
 *     startsWith: startsWith('regle')
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#startswith Documentation}
 */
export const startsWith: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createStringOperationRule({
  type: 'startsWith',
  operation: 'startsWith',
});
