/**
 * @returns ⚠️ Warning, returned value can be NaN
 */
export function toNumber<T extends number | string | undefined>(argument: T): number {
  if (typeof argument === 'number') {
    return argument;
  } else if (argument != null) {
    const isPadded = argument.trim() !== argument;
    if (isPadded) {
      return NaN;
    }
    return +argument;
  }
  return NaN;
}
