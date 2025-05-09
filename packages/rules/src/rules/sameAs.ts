import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty } from '../helpers';
import type { MaybeRefOrGetter } from 'vue';

/**
 * Checks if the value matches the specified property or ref.
 */
export const sameAs: <const TTarget extends unknown>(
  target: MaybeRefOrGetter<TTarget>,
  otherName?: MaybeRefOrGetter<string>
) => RegleRuleDefinition<
  unknown,
  [target: TTarget, otherName?: string],
  false,
  boolean,
  TTarget extends MaybeInput<infer M> ? M : MaybeInput<TTarget>
> = createRule({
  type: 'sameAs',
  validator(value: unknown, target: unknown, otherName?: string) {
    if (isEmpty(value)) {
      return true;
    }
    return value === target;
  },
  message({ $params: [_, otherName = 'other'] }) {
    return `The value must be equal to the ${otherName} value`;
  },
}) as any;
