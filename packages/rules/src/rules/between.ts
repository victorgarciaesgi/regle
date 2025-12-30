import { isFilled, toNumber, isNumber } from '../helpers';
import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import type { CommonComparisonOptions } from '@regle/core';

/**
 * Checks if a number is in specified bounds. `min` and `max` are both inclusive by default.
 *
 * @param min - The minimum limit
 * @param max - The maximum limit
 * @param options - Optional configuration (e.g., `{ allowEqual: false }` for exclusive bounds)
 * @param options.allowEqual - Optional flag to allow equal bounds
 *
 * @example
 * ```ts
 * import { between } from '@regle/rules';
 *
 * const maxCount = ref(6);
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: {
 *     between: between(1, 6),
 *     // or with reactive max
 *     between: between(1, maxCount, { allowEqual: false }),
 *     // or with getter
 *     between: between(() => maxCount.value, 10)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#between Documentation}
 */
export const between: RegleRuleWithParamsDefinition<
  number,
  [min: number, max: number, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<number>
> = createRule({
  type: 'between',
  validator: (value: MaybeInput<number>, min: number, max: number, options?: CommonComparisonOptions) => {
    const { allowEqual = true } = options ?? {};

    if (isFilled(value) && isFilled(min) && isFilled(max)) {
      const tValue = toNumber(value);
      const tMin = toNumber(min);
      const tMax = toNumber(max);
      if (isNumber(tValue) && isNumber(tMin) && isNumber(tMax)) {
        if (allowEqual) {
          return tValue >= tMin && tValue <= tMax;
        } else {
          return tValue > tMin && tValue < tMax;
        }
      }
      if (__IS_DEV__) {
        console.warn(`[between] Value or parameters aren't numbers, got value: ${value}, min: ${min}, max: ${max}`);
      }
      return false;
    }
    return true;
  },
  message: ({ $params: [min, max] }) => {
    return `The value must be between ${min} and ${max}`;
  },
});
