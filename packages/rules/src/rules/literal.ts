import type { MaybeInput, RegleRuleDefinition } from '@regle/core';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { isFilled, withMessage, withParams } from '../helpers';

/**
 * Allow only one possible literal value.
 *
 * @param literal - The literal value to match
 *
 * @example
 * ```ts
 * import { literal } from '@regle/rules';
 *
 * const { r$ } = useRegle({ status: '' }, {
 *   status: { literal: literal('active') },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#literal Documentation}
 */
export function literal<const TValue extends string | number>(
  literal: MaybeRefOrGetter<TValue>
): RegleRuleDefinition<TValue, [literal: TValue], false, boolean, MaybeInput<TValue>, string | number> {
  const params = computed<string | number>(() => toValue(literal));

  const rule = withMessage(
    withParams(
      (value: MaybeInput<string | number>, literal) => {
        if (isFilled(value) && isFilled(literal)) {
          return literal === value;
        }
        return true;
      },
      [params]
    ),
    ({ $params: [literal] }) => `Value should be ${literal}.`
  );

  return rule as any;
}
