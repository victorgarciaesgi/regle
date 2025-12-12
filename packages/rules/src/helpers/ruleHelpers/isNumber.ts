/**
 * Type guard that checks if the passed value is a real `Number`.
 * Returns `false` for `NaN`, making it safer than `typeof value === "number"`.
 *
 * @param value - The value to check
 * @returns `true` if value is a valid number (not `NaN`), `false` otherwise
 *
 * @example
 * ```ts
 * import { createRule, type Maybe } from '@regle/core';
 * import { isFilled, isNumber } from '@regle/rules';
 *
 * const rule = createRule({
 *   validator(value: Maybe<number | string>) {
 *     if (isFilled(value) && isNumber(value)) {
 *       return checkNumber(value);
 *     }
 *     return true;
 *   },
 *   message: 'Error'
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#isnumber Documentation}
 */
export function isNumber(value: unknown): value is number {
  if (value == null) return false;
  else if (typeof value !== 'number') {
    return false;
  } else if (isNaN(value)) {
    return false;
  } else {
    return true;
  }
}
