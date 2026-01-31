import {
  createRule,
  type MaybeInput,
  type MaybeReadonly,
  type RegleRuleDefinition,
  type NonEmptyTuple,
} from '@regle/core';
import { type MaybeRefOrGetter } from 'vue';
import { isFilled } from '../helpers';

interface OneOfFn {
  <const TValues extends NonEmptyTuple<string | number> | NonEmptyTuple<string> | NonEmptyTuple<number>>(
    options: MaybeReadonly<MaybeRefOrGetter<[...TValues]>>
  ): RegleRuleDefinition<
    'oneOf',
    TValues[number],
    [options: TValues],
    false,
    boolean,
    MaybeInput<TValues[number]>,
    string | number
  >;
  /** Keep this definition without generics for inference */
  (
    options: MaybeReadonly<MaybeRefOrGetter<[...[string | number, ...(string | number)[]]]>>
  ): RegleRuleDefinition<
    'oneOf',
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
 *
 * @param options - Array of allowed values
 *
 * @example
 * ```ts
 * import { oneOf } from '@regle/rules';
 *
 * const { r$ } = useRegle({ aliment: 'Fish' }, {
 *   aliment: {
 *     oneOf: oneOf(['Fish', 'Meat', 'Bone'])
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#oneof Documentation}
 */
export const oneOf: OneOfFn = createRule({
  type: 'oneOf',
  validator(value: MaybeInput<string | number>, options: [string | number, ...(string | number)[]]) {
    if (isFilled(value) && isFilled(options, false)) {
      return options.includes(value);
    }

    return true;
  },
  message: ({ $params: [options] }) => `The value must be one of the following: ${options.join(', ')}`,
}) as any;
