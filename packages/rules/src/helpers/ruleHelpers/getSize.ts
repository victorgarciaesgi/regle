import type { MaybeRef } from 'vue';
import { unref } from 'vue';

/**
 * This helper will return the length of any data type you pass. It works with strings, arrays, objects and numbers.
 */
export function getSize(value: MaybeRef<string | any[] | Record<string, any> | number>): number {
  const _value = unref(value);
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
