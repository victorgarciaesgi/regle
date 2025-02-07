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
      (obj.$each ??= [])[thisProp] = {};
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
      obj[lastProp] = { ...obj[lastProp], $self: value };
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
