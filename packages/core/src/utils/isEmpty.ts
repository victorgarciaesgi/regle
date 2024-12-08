export function isEmpty(value: unknown): value is null | undefined {
  if (value === undefined || value === null) {
    return true;
  }

  if (value instanceof Date) {
    // invalid date won't pass
    return isNaN(value.getTime());
  }
  if (Array.isArray(value)) {
    return false;
  }
  if (typeof value === 'object' && value != null) {
    return Object.keys(value).length === 0;
  }
  if (typeof value === 'string') {
    return !String(value.trim()).length;
  }
  return false;
}
