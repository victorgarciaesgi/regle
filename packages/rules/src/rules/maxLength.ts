import type { MaybeInput, RegleRuleWithParamsDefinition, CommonComparisonOptions, MeasurableValue } from '@regle/core';
import { createLengthRule } from './common/createLengthRule';

/**
 * Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects, numbers, and strings.
 *
 * @param max - The maximum length
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 * @param options.allowEqual - Optional flag to allow equal length
 *
 * @example
 * ```ts
 * import { maxLength } from '@regle/rules';
 *
 * const maxValue = ref(6);
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     maxLength: maxLength(6),
 *     // or with reactive value
 *     maxLength: maxLength(maxValue),
 *     // or with getter
 *     maxLength: maxLength(() => maxValue.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#maxlength Documentation}
 */
export const maxLength: RegleRuleWithParamsDefinition<
  'maxLength',
  MeasurableValue,
  [max: number, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<MeasurableValue>
> = createLengthRule({
  type: 'maxLength',
  direction: 'max',
});
