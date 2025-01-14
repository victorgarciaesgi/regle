import { isEmpty } from './isEmpty';

/**
 * This is a useful helper that can check if the provided value is a Date, it is used internally for date rules. This can also check strings.
 */
export function isDate(value: unknown): value is Date {
  if (isEmpty(value)) {
    return false;
  }
  try {
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
  } catch (e) {
    return false;
  }
}
