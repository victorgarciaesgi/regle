import type { EmptyObject } from 'type-fest';
import { isFile } from './isFile';
import { isObject } from './object.utils';

/**
 * Checks if a value is empty in any way (including arrays and objects).
 * This is the inverse of `isFilled`.
 *
 * `isEmpty` also acts as a type guard.
 *
 * By default, it considers an empty array as `true`. You can override this behavior with `considerEmptyArrayInvalid`.
 *
 * @param value - The target value to check
 * @param considerEmptyArrayInvalid - When `false`, empty arrays are not considered empty (default: `true`)
 * @returns `true` if the value is empty, `false` otherwise
 *
 * @example
 * ```ts
 * import { createRule, type Maybe } from '@regle/core';
 * import { isEmpty } from '@regle/rules';
 *
 * const rule = createRule({
 *   validator(value: Maybe<string>) {
 *     if (isEmpty(value)) {
 *       return true;
 *     }
 *     return check(value);
 *   },
 *   message: 'Error'
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#isempty Documentation}
 */
export function isEmpty(
  value: unknown,
  considerEmptyArrayInvalid = true,
  considerEmptyObjectInvalid = true
): value is null | undefined | [] | EmptyObject {
  if (value === undefined || value === null) {
    return true;
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return isNaN(value.getTime());
  } else if (isFile(value)) {
    // empty files won't pass
    return (value as File).size <= 0;
  } else if (Array.isArray(value)) {
    if (considerEmptyArrayInvalid) {
      return value.length === 0;
    }
    return false;
  } else if (isObject(value)) {
    if (value == null) {
      return true;
    }
    if (considerEmptyObjectInvalid) {
      return Object.keys(value).length === 0;
    }
    return false;
  }
  return !String(value).length;
}
