import { isEmpty } from '../../../../shared';

/**
 * This is almost a must have for optional fields. It checks if any value you provided is defined (including arrays and objects). You can base your validator result on this.
 *
 * isFilled also acts as a type guard.
 *
 * @param value - the target value
 * @param [considerEmptyArrayInvalid=true] - will return true if set to `false`. (default: `true`)
 */
export function isFilled<T extends unknown>(value: T, considerEmptyArrayInvalid = true): value is NonNullable<T> {
  return !isEmpty(typeof value === 'string' ? value.trim() : value, considerEmptyArrayInvalid);
}
