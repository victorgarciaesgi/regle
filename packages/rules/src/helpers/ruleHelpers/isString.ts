/**
 * Type guard that checks if the passed value is a real `String`.
 */
export function isString(value: unknown): value is string {
  if (value == null) return false;
  else if (typeof value !== 'string') {
    return false;
  }
  return true;
}
