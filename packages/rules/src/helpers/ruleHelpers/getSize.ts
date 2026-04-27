import type { MaybeRefOrGetter } from 'vue';
import { toValue } from 'vue';
import type { MeasurableValue } from '@regle/core';

/**
 * Returns the length of strings, numbers, arrays, or number of keys for objects.
 *
 * @param value - The value to get the size of
 * @returns The length of strings, numbers, arrays, and number of keys for objects
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
export function getSize(value: MaybeRefOrGetter<MeasurableValue>): number {
  const _value = toValue(value);
  if (_value instanceof Set || _value instanceof Map) {
    return _value.size;
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
