/**
 * Converts any string (or number) into a number using the `Number` constructor.
 *
 * @param argument - The value to convert
 * @returns The converted number (⚠️ Warning: returned value can be `NaN`)
 *
 * @example
 * ```ts
 * import { toNumber, isNumber } from '@regle/rules';
 *
 * const num = toNumber('42'); // 42
 * const invalid = toNumber('abc'); // NaN
 *
 * // Always check for NaN when using toNumber
 * if (!isNaN(toNumber(value))) {
 *   // Safe to use as number
 * }
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#tonumber Documentation}
 */
export function toNumber<T extends number | string | undefined>(argument: T): number {
  if (typeof argument === 'number') {
    return argument;
  } else if (argument != null) {
    if (typeof argument === 'string') {
      const isPadded = argument.trim() !== argument;
      if (isPadded) {
        return NaN;
      }
      return +argument;
    }
    return NaN;
  }
  return NaN;
}
