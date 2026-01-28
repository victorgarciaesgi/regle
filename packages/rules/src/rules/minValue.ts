import type { CommonComparisonOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createValueComparisonRule } from '../helpers/ruleHelpers';

/**
 * Requires a field to have a specified minimum numeric value.
 *
 * @param min - The minimum value
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 * @param options.allowEqual - Optional flag to allow equal value
 *
 * @example
 * ```ts
 * import { minValue } from '@regle/rules';
 *
 * const minCount = ref(6);
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: {
 *     minValue: minValue(6),
 *     // or with options
 *     minValue: minValue(minCount, { allowEqual: false }),
 *     // or with getter
 *     minValue: minValue(() => minCount.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#minvalue Documentation}
 */
export const minValue: RegleRuleWithParamsDefinition<
  number | string,
  [min: number | string, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<number | string>
> = createValueComparisonRule({
  type: 'minValue',
  direction: 'min',
});
