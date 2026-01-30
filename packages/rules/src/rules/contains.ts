import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createStringOperationRule } from './common/createStringOperationRule';

/**
 * Checks if the string contains the specified substring.
 *
 * @param part - The substring the value must contain
 *
 * @example
 * ```ts
 * import { contains } from '@regle/rules';
 *
 * const { r$ } = useRegle({ bestLib: '' }, {
 *   bestLib: {
 *     contains: contains('regle')
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#contains Documentation}
 */
export const contains: RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> = createStringOperationRule({
  type: 'contains',
  operation: 'contains',
});
