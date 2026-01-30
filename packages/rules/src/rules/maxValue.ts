import type { CommonComparisonOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createValueComparisonRule } from './common/createComparisonRule';

/**
 * Requires a field to have a specified maximum numeric value.
 *
 * @param max - The maximum value
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 * @param options.allowEqual - Optional flag to allow equal value
 *
 * @example
 * ```ts
 * import { maxValue } from '@regle/rules';
 *
 * const maxCount = ref(6);
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: {
 *     maxValue: maxValue(6),
 *     // or with options
 *     maxValue: maxValue(maxCount, { allowEqual: false }),
 *     // or with getter
 *     maxValue: maxValue(() => maxCount.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#maxvalue Documentation}
 */
export const maxValue: RegleRuleWithParamsDefinition<
  number | string,
  [max: number | string, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<number | string>
> = createValueComparisonRule({
  type: 'maxValue',
  direction: 'max',
});
