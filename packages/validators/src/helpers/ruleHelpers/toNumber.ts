export function toNumber(argument: number | string) {
  if (typeof argument === 'number') {
    return argument;
  } else {
    const isPadded = argument.trim() !== argument;
    if (isPadded) {
      return null;
    }
    return +argument;
  }
}
