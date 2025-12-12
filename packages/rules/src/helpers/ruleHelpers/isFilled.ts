import { isEmpty } from '../../../../shared';

/**
 * Checks if any value you provide is defined (including arrays and objects).
 * This is almost a must-have for optional fields when writing custom rules.
 *
 * `isFilled` also acts as a type guard.
 *
 * By default, it considers an empty array as `false`. You can override this behavior with `considerEmptyArrayInvalid`.
 *
 * @param value - The target value to check
 * @param considerEmptyArrayInvalid - When `false`, empty arrays are considered filled (default: `true`)
 * @returns `true` if the value is filled, `false` otherwise
 *
 * @example
 * ```ts
 * import { createRule } from '@regle/core';
 * import { isFilled } from '@regle/rules';
 *
 * const rule = createRule({
 *   validator(value: unknown) {
 *     if (isFilled(value)) {
 *       return check(value);
 *     }
 *     return true;
 *   },
 *   message: 'Error'
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#isfilled Documentation}
 */
export function isFilled<T extends unknown>(value: T, considerEmptyArrayInvalid = true): value is NonNullable<T> {
  return !isEmpty(typeof value === 'string' ? value.trim() : value, considerEmptyArrayInvalid);
}
