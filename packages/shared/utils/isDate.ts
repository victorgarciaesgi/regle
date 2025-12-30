import { isEmpty } from './isEmpty';

/**
 * Checks if the provided value is a valid Date. Used internally for date rules.
 * Can also validate date strings.
 *
 * @param value - The value to check
 * @returns `true` if the value is a valid Date or date string, `false` otherwise
 *
 * @example
 * ```ts
 * import { createRule, type Maybe } from '@regle/core';
 * import { isFilled, isDate } from '@regle/rules';
 *
 * const rule = createRule({
 *   validator(value: Maybe<string | Date>) {
 *     if (isFilled(value) && isDate(value)) {
 *       return checkDate(value);
 *     }
 *     return true;
 *   },
 *   message: 'Error'
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#isdate Documentation}
 */
export function isDate(value: unknown): value is Date | string {
  if (isEmpty(value)) {
    return false;
  }
  let possibleDate: Date | null = null;
  if (value instanceof Date) {
    possibleDate = value;
  } else if (typeof value === 'string') {
    const date = new Date(value);
    if (date.toString() === 'Invalid Date') {
      return false;
    }
    possibleDate = date;
  }
  return !!possibleDate;
}
