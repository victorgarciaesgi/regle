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
