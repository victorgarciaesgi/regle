import type { EmptyObject } from 'type-fest';

/**
 * This is the inverse of isFilled. It will check if the value is in any way empty (including arrays and objects)

  isEmpty also acts as a type guard.
 */
export function isEmpty(value: unknown): value is null | undefined | [] | EmptyObject {
  if (value === undefined || value === null) {
    return true;
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return isNaN(value.getTime());
  }
  if (Array.isArray(value)) {
    return false;
  }
  if (typeof value === 'object' && value != null) {
    return Object.keys(value).length === 0;
  }
  return !String(value).length;
}
