import { isObject } from './object.utils';

export function isEqual(a: unknown, b: unknown, deep = false, firstDeep = true) {
  if (a === b) return true;

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) return false;

    var length, i, keys;
    if (Array.isArray(a) && Array.isArray(b)) {
      length = a.length;
      if (length != b.length) return false;
      if (firstDeep || (!firstDeep && deep)) {
        for (i = length; i-- !== 0; ) {
          if (!isEqual(a[i], b[i], deep, false)) {
            return false;
          }
        }
      }
      return true;
    }

    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

    keys = Object.keys(a);
    length = keys.length;
    if (length !== Object.keys(b).length) return false;

    for (i = length; i-- !== 0; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

    for (i = length; i-- !== 0; ) {
      var key = keys[i];
      if (isObject(a) && isObject(b) && key) {
        if (firstDeep || (!firstDeep && deep)) {
          if (!isEqual(a[key], b[key], deep, false)) {
            return false;
          }
        }
      }
      return true;
    }

    return true;
  }

  return a !== a && b !== b;
}
