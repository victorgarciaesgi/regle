import { isEmpty } from './isEmpty';

export function isFilled<T extends unknown>(value: T): value is NonNullable<T> {
  return !isEmpty(typeof value === 'string' ? value.trim() : value);
}
