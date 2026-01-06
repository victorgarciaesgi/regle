/**
 * Coerces any string, number, or Date value into a `Date` using the `Date` constructor.
 *
 * @param argument - The value to convert to a Date
 * @returns A new Date object (may be invalid if input cannot be parsed)
 *
 * @example
 * ```ts
 * import { toDate } from '@regle/rules';
 *
 * const date1 = toDate('2024-01-15'); // Date object
 * const date2 = toDate(1705276800000); // Date from timestamp
 * const date3 = toDate(new Date()); // Clone of Date
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#todate Documentation}
 */
export function toDate(argument: Date | number | string | null | undefined): Date {
  const argStr = Object.prototype.toString.call(argument);
  if (argument == null) {
    return new Date(NaN);
  } else if (argument instanceof Date || (typeof argument === 'object' && argStr === '[object Date]')) {
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else if (typeof argument === 'string' || argStr === '[object String]') {
    return new Date(argument);
  } else {
    return new Date(NaN);
  }
}
