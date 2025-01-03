import { isEmpty } from '../../../../shared';

/**
 * This is almost a must have for optional fields. It checks if any value you provided is defined (including arrays and objects). You can base your validator result on this.

  isFilled also acts as a type guard.
 */
export function isFilled<T extends unknown>(value: T): value is NonNullable<T> {
  return !isEmpty(typeof value === 'string' ? value.trim() : value);
}
