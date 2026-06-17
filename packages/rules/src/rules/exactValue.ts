import { isFilled, isNumber, toNumber } from '../helpers';
import type { RegleRuleWithParamsDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { diagnostics } from '../diagnostics/rules';

/**
 * Requires a field to have a strict numeric value.
 *
 * @param count - The exact required numeric value
 *
 * @example
 * ```ts
 * import { exactValue } from '@regle/rules';
 *
 * const exactCount = ref(6);
 *
 * const { r$ } = useRegle({ count: 0 }, {
 *   count: {
 *     exactValue: exactValue(6),
 *     // or with reactive value
 *     exactValue: exactValue(exactCount),
 *     // or with getter
 *     exactValue: exactValue(() => exactCount.value)
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#exactvalue Documentation}
 */
export const exactValue: RegleRuleWithParamsDefinition<
  'exactValue',
  number,
  [count: number],
  false,
  boolean,
  MaybeInput<number>
> = createRule({
  type: 'exactValue',
  validator: (value: MaybeInput<number>, count: number) => {
    if (isFilled(value) && isFilled(count)) {
      if (isNumber(count) && !isNaN(toNumber(value))) {
        return toNumber(value) === count;
      }
      if (__IS_DEV__) {
        diagnostics.REGLE_R0101({ rule: 'exactValue', value, param: count });
      }
      return true;
    }
    return true;
  },
  message: ({ $params: [count] }) => {
    return `The value must be equal to ${count}`;
  },
});
