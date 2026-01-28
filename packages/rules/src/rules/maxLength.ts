import type { RegleRuleWithParamsDefinition } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';
import { createLengthRule } from '../helpers/ruleHelpers';

/**
 * Requires the input value to have a maximum specified length, inclusive. Works with arrays, objects and strings.
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
  string | any[] | Record<PropertyKey, any>,
  [max: number, options?: CommonComparisonOptions],
  false,
  boolean
> = createLengthRule({
  type: 'maxLength',
  direction: 'max',
});
