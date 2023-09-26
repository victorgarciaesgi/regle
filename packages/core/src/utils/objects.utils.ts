export function isEmpty(value: unknown): boolean {
  if (typeof value === 'object' && value != null) {
    if (Array.isArray(value)) {
      return value.length === 0;
    } else {
      return Object.keys(value).length === 0;
    }
  } else {
    return true;
  }
}
