export function isEmpty(value: unknown): value is null | undefined {
  if (value === undefined || value === null) {
    return true;
  }

  if (value === false) {
    return false;
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return isNaN(value.getTime());
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object' && value != null) {
    return Object.keys(value).length === 0;
  }
  if (typeof value === 'number') {
    return isNaN(value);
  }

  return !String(value).trim().length;
}
