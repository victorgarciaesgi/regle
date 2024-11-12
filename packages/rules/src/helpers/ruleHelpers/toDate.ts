export function toDate(argument: Date) {
  const argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || (typeof argument === 'object' && argStr === '[object Date]')) {
    return new Date(argument.getTime());
  } else if (typeof argument === 'number' || argStr === '[object Number]') {
    return new Date(argument);
  } else if (typeof argument === 'string' || argStr === '[object String]') {
    return new Date(argument);
  } else {
    return new Date(NaN);
  }
}
