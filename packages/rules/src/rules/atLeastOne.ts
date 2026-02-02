import { createRule, type Maybe, type RegleRuleDefinition, type RegleRuleWithParamsDefinition } from '@regle/core';
import type { MaybeRefOrGetter } from 'vue';
import { isObject } from '../../../shared';
import { getSize, isFilled } from '../helpers';

interface AtLeastOneFn extends RegleRuleWithParamsDefinition<
  'atLeastOne',
  Record<string, unknown> | object,
  [keys?: string[] | undefined],
  false,
  boolean,
  false,
  Record<string, unknown> | object
> {
  <T extends Maybe<Record<string, unknown> | object> = Record<string, unknown>>(
    keys?: MaybeRefOrGetter<(keyof NoInfer<T> & string)[]>
  ): RegleRuleDefinition<'atLeastOne', T, [keys?: (keyof NoInfer<T> & string)[] | undefined], false, boolean, false, T>;
}

/**
 * Checks if at least one key is filled in the object.
 *
 * @example
 * ```ts
 * import { atLeastOne } from '@regle/rules';
 *
 * const { r$ } = useRegle({ user: { firstName: '', lastName: '' } }, {
 *   user: {
 *    atLeastOne,
 *    // or
 *    atLeastOne: atLeastOne(['firstName', 'lastName'])
 *    // or
 *    atLeastOne: atLeastOne<{ firstName: string; lastName: string }>(['firstName', 'lastName'])
 *   },
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#atleastone Documentation}
 */
export const atLeastOne: AtLeastOneFn = createRule({
  type: 'atLeastOne',
  validator: (value: Maybe<Record<string, unknown> | object>, keys?: string[]) => {
    if (isFilled(value, true, false) && isObject(value)) {
      if (keys?.length) {
        return keys.some((key) => isFilled(value[key]));
      }
      return getSize(value) > 0;
    }
    return true;
  },
  message: 'At least one item is required',
});
