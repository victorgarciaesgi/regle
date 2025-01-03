/**
 * This is a type guard that will check if the passed value is a real Number. This also returns false for NaN, so this is better than typeof value === "number".
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
