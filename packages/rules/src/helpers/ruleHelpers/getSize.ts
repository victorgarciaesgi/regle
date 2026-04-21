import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import type { Maybe } from '@regle/core';
import { isEmpty } from '../../../../shared';

/**
 * Returns the length/size of any data type. Works with strings, arrays, objects and numbers.
 *
 * @param value - The value to get the size of
 * @returns The length of strings/numbers/arrays, number of keys for objects, or zero on empty values
 *
 * @example
 * ```ts
 * import { createRule, type Maybe } from '@regle/core';
 * import { isFilled, getSize } from '@regle/rules';
 *
 * const rule = createRule({
 *   validator(value: Maybe<string | Array<number>>) {
 *     return getSize(value) > 6;
 *   },
 *   message: 'Error'
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#getsize Documentation}
 */
export function getSize(value: MaybeRefOrGetter<Maybe<string | number | any[] | Record<string, any>>>): number {
  const _value = toValue(value);
  if (isEmpty(_value)) {
    return 0;
  }
  if (Array.isArray(_value)) {
    return _value.length;
  }
  if (typeof _value === 'object') {
    return Object.keys(_value).length;
  }
  if (Number.isNaN(_value)) {
    return 0;
  }
  return String(_value).length;
}
