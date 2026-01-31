import type { RegleRuleWithParamsDefinition } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';
import { createLengthRule } from './common/createLengthRule';

/**
 * Requires the input value to have a minimum specified length, inclusive. Works with arrays, objects and strings.
 *
 * @param min - The minimum length
 * @param options - Optional configuration (e.g., `{ allowEqual: false }`)
 * @param options.allowEqual - Optional flag to allow equal length
 *
 * @example
 * ```ts
 * import { minLength } from '@regle/rules';
 *
 * const minValue = ref(6);
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     minLength: minLength(6),
 *     // or with reactive value
 *     minLength: minLength(minValue),
 *     // or with getter
 *     minLength: minLength(() => minValue.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#minlength Documentation}
 */
export const minLength: RegleRuleWithParamsDefinition<
  'minLength',
  string | any[] | Record<PropertyKey, any>,
  [min: number, options?: CommonComparisonOptions],
  false,
  boolean
> = createLengthRule({
  type: 'minLength',
  direction: 'min',
});
