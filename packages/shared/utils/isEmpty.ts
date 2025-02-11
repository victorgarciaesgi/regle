import type { EmptyObject } from 'type-fest';

/**
 * This is the inverse of isFilled. It will check if the value is in any way empty (including arrays and objects)
 *
 * isEmpty also acts as a type guard.
 *
 * @param value - the target value
 * @param [considerEmptyArrayInvalid=true] - will return false if set to `false`. (default: `true`)
 */
export function isEmpty(
  value: unknown,
  considerEmptyArrayInvalid = true
): value is null | undefined | [] | EmptyObject {
  if (value === undefined || value === null) {
    return true;
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return isNaN(value.getTime());
  } else if (value.constructor.name == 'File' || value.constructor.name == 'FileList') {
    // empty files won't pass
    return (value as File).size > 0;
  } else if (Array.isArray(value)) {
    if (considerEmptyArrayInvalid) {
      return value.length === 0;
    }
    return false;
  } else if (typeof value === 'object' && value != null) {
    return Object.keys(value).length === 0;
  }
  return !String(value).length;
}
