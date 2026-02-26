import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';

/**
 * Returns the length/size of any data type. Works with strings, arrays, objects and numbers.
 *
 * @param value - The value to get the size of
 * @returns The length of strings/arrays, number of keys for objects, or the number itself
 *
 * @example
 * ```ts
 * import { createRule, type Maybe } from '@regle/core';
 * import { isFilled, getSize } from '@regle/rules';
 *
 * const rule = createRule({
 *   validator(value: Maybe<string | Array<number>>) {
 *     if (isFilled(value)) {
 *       return getSize(value) > 6;
 *     }
 *     return true;
 *   },
 *   message: 'Error'
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#getsize Documentation}
 */
export function getSize(value: MaybeRefOrGetter<string | any[] | Record<string, any> | number>): number {
  const _value = toValue(value);
  if (Array.isArray(_value)) return _value.length;
  if (typeof _value === 'object') {
    return Object.keys(_value).length;
  }
  if (typeof _value === 'number') {
    if (isNaN(_value)) {
      return 0;
    }
    return _value;
  }
  return String(_value).length;
}
