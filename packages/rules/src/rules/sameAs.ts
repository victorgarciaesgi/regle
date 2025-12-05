import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty } from '../helpers';
import type { MaybeRefOrGetter } from 'vue';

interface SameAsFn {
  <TTarget extends unknown = unknown>(
    target: MaybeRefOrGetter<TTarget>,
    otherName?: MaybeRefOrGetter<string>
  ): RegleRuleDefinition<
    TTarget,
    [target: TTarget, otherName?: string],
    false,
    boolean,
    TTarget extends MaybeInput<infer M> ? M : MaybeInput<TTarget>
  >;
  /** Keep this definition without generics for inference */
  (
    target: MaybeRefOrGetter<unknown>,
    otherName?: MaybeRefOrGetter<string>
  ): RegleRuleDefinition<
    unknown,
    [target: any, otherName?: string],
    false,
    boolean,
    unknown extends MaybeInput<infer M> ? M : MaybeInput<unknown>
  >;
}

/**
 * Checks if the value matches the specified property or ref. Useful for password confirmation fields.
 *
 * @param target - The target value to compare against (can be a ref or getter)
 * @param otherName - Optional name for the other field (used in error message)
 *
 * @example
 * ```ts
 * import { sameAs } from '@regle/rules';
 *
 * const form = ref({
 *   password: '',
 *   confirmPassword: '',
 * });
 *
 * const { r$ } = useRegle(form, {
 *   confirmPassword: {
 *     sameAs: sameAs(() => form.value.password),
 *   }
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#sameas Documentation}
 */
export const sameAs: SameAsFn = createRule({
  type: 'sameAs',
  validator(value: unknown, target: unknown, _otherName?: string) {
    if (isEmpty(value)) {
      return true;
    }
    return value === target;
  },
  message({ $params: [_, otherName = 'other'] }) {
    return `The value must be equal to the ${otherName} value`;
  },
}) as any;
