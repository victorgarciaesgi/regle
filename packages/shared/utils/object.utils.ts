import { isEmpty } from './isEmpty';

export function isObject(obj: unknown): obj is Record<string, any> {
  if (obj && (obj instanceof Date || obj.constructor.name == 'File' || obj.constructor.name == 'FileList')) {
    return false;
  }
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function setObjectError(obj: Record<string, any>, propsArg: string | undefined, value: any, isArray: boolean) {
  var props, lastProp;
  if (Array.isArray(propsArg)) {
    props = propsArg.slice(0);
  }
  if (typeof propsArg == 'string') {
    props = propsArg.split('.');
  }
  if (typeof propsArg == 'symbol') {
    props = [propsArg];
  }
  if (!Array.isArray(props)) {
    throw new Error('props arg must be an array, a string or a symbol');
  }
  lastProp = props.pop();
  if (!lastProp) {
    return false;
  }
  prototypeCheck(lastProp);
  var thisProp;
  while ((thisProp = props.shift())) {
    prototypeCheck(thisProp);

    if (!isNaN(parseInt(thisProp))) {
      if (obj.$each == undefined) {
        obj.$each = [];
      }
      if (isEmpty(obj.$each[thisProp])) {
        obj.$each[thisProp] = {};
      }
      obj = obj.$each[thisProp];
    } else {
      if (typeof obj[thisProp] == 'undefined') {
        obj[thisProp] = {};
      }
      obj = obj[thisProp];
    }
    if (!obj || typeof obj != 'object') {
      return false;
    }
  }
  if (isArray) {
    if (!obj[lastProp]) {
      obj[lastProp] = { $self: value };
    } else {
      obj[lastProp].$self = (obj[lastProp].$self ??= []).concat(value);
    }
  } else {
    if (Array.isArray(obj[lastProp])) {
      obj[lastProp] = obj[lastProp].concat(value);
    } else {
      obj[lastProp] = value;
    }
  }
  return true;
}

export function getDotPath(obj: Record<string, any>, propsArg: string | string[], defaultValue?: any) {
  if (!obj) {
    return defaultValue;
  }
  var props: any, prop: any;
  if (Array.isArray(propsArg)) {
    props = propsArg.slice(0);
  }
  if (typeof propsArg == 'string') {
    props = propsArg.split('.');
  }
  if (typeof propsArg == 'symbol') {
    props = [propsArg];
  }
  if (!Array.isArray(props)) {
    throw new Error('props arg must be an array, a string or a symbol');
  }
  while (props.length) {
    prop = props.shift();
    if (!obj) {
      return defaultValue;
    }
    if (!prop) {
      return defaultValue;
    }
    obj = obj[prop];
    if (obj === undefined) {
      return defaultValue;
    }
  }
  return obj;
}

function prototypeCheck(prop: string) {
  // coercion is intentional to catch prop values like `['__proto__']`
  if (prop == '__proto__' || prop == 'constructor' || prop == 'prototype') {
    throw new Error('setting of prototype values not supported');
  }
}

export function merge<TObj1 extends object = object, TObjs extends object = object>(
  _obj1: TObj1,
  ..._objs: TObjs[]
): TObj1 & TObjs {
  var args = [].slice.call(arguments);
  var arg;
  var i = args.length;
  while (((arg = args[i - 1]), i--)) {
    if (!arg || (typeof arg != 'object' && typeof arg != 'function')) {
      throw new Error('expected object, got ' + arg);
    }
  }
  var result = args[0];
  var extenders = args.slice(1);
  var len = extenders.length;
  for (var i = 0; i < len; i++) {
    var extender = extenders[i];
    for (var key in extender) {
      result[key] = extender[key];
    }
  }
  return result;
}

/**
 * Converts an object with dot-path keys into a nested object structure.
 * Example:
 *   {
 *     "user.email": "foo",
 *     "password": "bar",
 *     "collection.0.name": "hello"
 *   }
 * becomes:
 *   {
 *     user: { email: "foo" },
 *     password: "bar",
 *     collection: [{ name: "hello" }]
 *   }
 */
export function dotPathObjectToNested(obj: Record<string, any> | undefined): Record<string, any> {
  const result: Record<string, any> = {};

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    const path = key.split('.');
    let current = result;

    for (let i = 0; i < path.length; i++) {
      const part = path[i];
      const isLast = i === path.length - 1;
      // Check if this part is an array index
      const arrayIndex = part.match(/^\d+$/) ? Number(part) : null;

      if (arrayIndex !== null) {
        // This part is an array index

        if (Array.isArray(current)) {
          if (isLast) {
            current[arrayIndex] = value;
          } else {
            if (typeof current[arrayIndex] !== 'object' || current[arrayIndex] === null) {
              // Decide if next is array or object
              const nextPart = path[i + 1];
              current[arrayIndex] = nextPart && nextPart.match(/^\d+$/) ? { $each: [], $self: [] } : {};
            }
            current = '$each' in current[arrayIndex] ? current[arrayIndex].$each : current[arrayIndex];
          }
        }
      } else {
        // This part is an object key
        if (isLast) {
          if (Array.isArray(current[part])) {
            let previous = current[part].slice();
            current[part] = {};
            current[part].$self = previous;
          } else if (typeof current[part] === 'object' && current[part] !== null && '$each' in current[part]) {
            current[part].$self = value;
          } else {
            current[part] = value;
          }
        } else {
          const nextPart = path[i + 1];

          if (Array.isArray(current[part])) {
            let previous = current[part].slice();
            current[part] = { $each: [] };
            current[part].$self = previous;
          }
          if (
            typeof current[part] !== 'object' ||
            current[part] === null ||
            (Array.isArray(current[part]) && !nextPart.match(/^\d+$/))
          ) {
            if (nextPart && nextPart.match(/^\d+$/)) {
              current[part] = { $each: [], $self: [] };
            } else {
              current[part] = {};
            }
          }
          if ('$each' in current[part]) {
            current = current[part].$each;
          } else {
            current = current[part];
          }
        }
      }
    }
  }

  return result;
}
