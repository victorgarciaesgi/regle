import { createRule, type MaybeInput, type MaybeReadonly, type RegleRuleDefinition } from '@regle/core';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { isFilled, withMessage, withParams } from '../helpers';

interface OneOfFn {
  <const TValues extends readonly [string | number, ...(string | number)[]]>(
    options: MaybeReadonly<MaybeRefOrGetter<[...TValues]>>
  ): RegleRuleDefinition<
    TValues[number],
    [options: TValues],
    false,
    boolean,
    MaybeInput<TValues[number]>,
    string | number
  >;
  /** Keep this definition without generics for inference */
  (
    options: MaybeReadonly<MaybeRefOrGetter<[...(readonly [string | number, ...(string | number)[]])]>>
  ): RegleRuleDefinition<
    string | number,
    [options: readonly [string | number, ...(string | number)[]]],
    false,
    boolean,
    MaybeInput<string | number>,
    string | number
  >;
}

/**
 * Allow only one of the values from a fixed Array of possible entries.
 */
export const oneOf: OneOfFn = createRule({
  type: 'oneOf',
  validator(value: MaybeInput<string | number>, options: [string | number, ...(string | number)[]]) {
    if (isFilled(value) && isFilled(options, false)) {
      return options.includes(value);
    }

    return true;
  },
  message: ({ $params: [options] }) => `The value should be one of those options: ${options.join(', ')}.`,
}) as any;
