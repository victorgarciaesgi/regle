import type { Maybe } from '@regle/core';

/**
 * This utility will coerce any string, number or Date value into a Date using the Date constructor.
 */
export function toDate(argument: Maybe<Date | number | string>): Date {
  const argStr = Object.prototype.toString.call(argument);
  if (argument == null) {
    return new Date(NaN);
  } else if (argument instanceof Date || (typeof argument === 'object' && argStr === '[object Date]')) {
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else if (typeof argument === 'string' || argStr === '[object String]') {
    return new Date(argument);
  } else {
    return new Date(NaN);
  }
}
