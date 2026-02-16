import {
  createRule,
  type MaybeInput,
  type MaybeReadonly,
  type RegleRuleDefinition,
  type NonEmptyTuple,
} from '@regle/core';
import { type MaybeRefOrGetter } from 'vue';
import { isFilled } from '../helpers';

export type EnumOneOfLike<TValue extends unknown> = {
  readonly [k: string]: TValue;
};

interface OneOfFn {
  <TEnum extends EnumOneOfLike<unknown>>(
    options: TEnum
  ): RegleRuleDefinition<
    'oneOf',
    TEnum[keyof TEnum],
    [options: TEnum],
    false,
    boolean,
    MaybeInput<TEnum[keyof TEnum]>,
    string | number
  >;
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
    options: MaybeReadonly<MaybeRefOrGetter<[...[string | number, ...(string | number)[]]]>> | EnumOneOfLike<unknown>
  ): RegleRuleDefinition<
    'oneOf',
    string | number,
    [options: readonly [string | number, ...(string | number)[]] | EnumOneOfLike<unknown>],
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
  validator(
    value: MaybeInput<string | number>,
    options: [string | number, ...(string | number)[]] | EnumOneOfLike<unknown>
  ) {
    if (isFilled(value) && isFilled(options, false)) {
      if (Array.isArray(options)) {
        return options.includes(value);
      } else {
        return Object.values(options).includes(value);
      }
    }

    return true;
  },
  message: ({ $params: [options] }) => {
    const optionsValues = Array.isArray(options) ? options : Object.values(options);
    return `The value must be one of the following: ${optionsValues.join(', ')}`;
  },
}) as any;
