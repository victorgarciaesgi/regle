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
  if (isPrototypeKey(lastProp)) {
    throw new Error('setting of prototype values not supported');
  }
  var thisProp;
  while ((thisProp = props.shift())) {
    if (isPrototypeKey(thisProp)) {
      throw new Error('setting of prototype values not supported');
    }

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
    if (!isNaN(parseInt(lastProp))) {
      if (obj.$each == undefined) {
        obj.$each = [];
      }
      obj.$each[lastProp] = (obj.$each[lastProp] ??= []).concat(value);
    } else if (Array.isArray(obj[lastProp])) {
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

function isPrototypeKey(prop: string): boolean {
  // coercion is intentional to catch prop values like `['__proto__']`
  const key = String(prop);
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}

export function merge<TObj1 extends object = object, TObjs extends [...any[]] = [...any[]]>(
  _obj1: TObj1,
  ..._objs: TObjs
): TObj1 & TObjs[number] {
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

const numericPartRegex = /^\d+$/;

function isCollectionConflict(
  fieldPath: string[],
  nextPart: string,
  state?: Record<string, any> | PrimitiveTypes
): boolean {
  if (state !== undefined && isObject(state)) {
    const pathKey = fieldPath.join('.');
    const stateValue = pathKey ? getDotPath(state, pathKey) : state;
    if (stateValue !== undefined) {
      return Array.isArray(stateValue);
    }
  }
  return numericPartRegex.test(nextPart);
}

type PrimitiveTypes = string | number | boolean | bigint | Date | File;

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
 *
 * When a parent key and a deeper dot-path key conflict (e.g. `user` + `user.email`),
 * the parent error is moved to `$self` and children are nested as object keys.
 * Collection fields use `$each` when the next segment is a numeric index.
 */
export function dotPathObjectToNested(
  obj: Record<string, any> | undefined,
  state?: Record<string, any> | PrimitiveTypes
): Record<string, any> {
  if (!obj) {
    return {};
  }

  const result: Record<string, any> = {};
  const entries = Object.entries(obj).sort((a, b) => b[0].split('.').length - a[0].split('.').length);

  for (const [key, value] of entries) {
    const path = key.split('.');
    let current = result;

    for (let i = 0; i < path.length; i++) {
      const part = path[i];
      if (isPrototypeKey(part)) break;
      const isLast = i === path.length - 1;
      const isNumericPart = numericPartRegex.test(part);
      const arrayIndex = Array.isArray(current) && isNumericPart ? Number(part) : null;
      const nextPart = path[i + 1];
      const fieldPath = path.slice(0, i + 1);

      if (arrayIndex !== null) {
        if (Array.isArray(current)) {
          if (isLast) {
            current[arrayIndex] = value;
          } else {
            if (typeof current[arrayIndex] !== 'object' || current[arrayIndex] === null) {
              current[arrayIndex] = nextPart && numericPartRegex.test(nextPart) ? { $each: [], $self: [] } : {};
            }
            current = '$each' in current[arrayIndex] ? current[arrayIndex].$each : current[arrayIndex];
          }
        }
      } else if (isLast) {
        if (typeof current[part] === 'object' && current[part] !== null && !Array.isArray(current[part])) {
          current[part].$self = value;
        } else {
          current[part] = value;
        }
      } else {
        const isCollection = isCollectionConflict(fieldPath, nextPart, state);

        if (Array.isArray(current[part])) {
          const previous = current[part].slice();
          current[part] = isCollection ? { $each: [], $self: previous } : { $self: previous };
        }

        if (typeof current[part] !== 'object' || current[part] === null) {
          current[part] = isCollection ? { $each: [], $self: [] } : {};
        }

        if (isCollection && '$each' in current[part]) {
          current = current[part].$each;
        } else {
          current = current[part];
        }
      }
    }
  }

  return result;
}

export function normalizeDotPathExternalValue<T>(
  value: T | undefined,
  state?: Record<string, unknown> | PrimitiveTypes
): T | undefined {
  if (value && isObject(value) && Object.keys(value).some((key) => key.includes('.'))) {
    return dotPathObjectToNested(value as Record<string, unknown>, state) as T;
  }
  return value;
}

export function hasOwn(val: object, key: string | symbol): key is keyof typeof val {
  return Object.prototype.hasOwnProperty.call(val, key);
}

export function def(obj: object, key: string | symbol, value: any, writable = false): void {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value,
  });
}

export function isConstructor(value: unknown): value is new (...args: any[]) => any {
  return (
    typeof value === 'function' &&
    !!value.prototype &&
    'constructor' in value.prototype &&
    value.prototype.constructor === value
  );
}
