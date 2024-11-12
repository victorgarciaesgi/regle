import type { Ref } from 'vue';
import type { MaybeGetter } from '../types';

export function isObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isRefObject(obj: Ref<unknown>): obj is Ref<Record<string, any>> {
  return isObject(obj.value);
}

export function cloneDeep(obj: { [x: string]: any }): {
  [x: string]: any;
} {
  let result = obj;
  let type = {}.toString.call(obj).slice(8, -1);
  if (type == 'Set') {
    return new Set([...(obj as any)].map((value) => cloneDeep(value)));
  }
  if (type == 'Map') {
    return new Map([...(obj as any)].map((kv) => [cloneDeep(kv[0]), cloneDeep(kv[1])]));
  }
  if (type == 'Date') {
    return new Date(obj.getTime());
  }
  if (type == 'RegExp') {
    return RegExp(obj.source, getRegExpFlags(obj));
  }
  if (type == 'Array' || type == 'Object') {
    result = Array.isArray(obj) ? [] : {};
    for (let key in obj) {
      // include prototype properties
      result[key] = cloneDeep(obj[key]);
    }
  }
  // primitives and non-supported objects (e.g. functions) land here
  return result;
}

function getRegExpFlags(regExp: any) {
  if (typeof regExp.source.flags == 'string') {
    return regExp.source.flags;
  } else {
    let flags = [];
    regExp.global && flags.push('g');
    regExp.ignoreCase && flags.push('i');
    regExp.multiline && flags.push('m');
    regExp.sticky && flags.push('y');
    regExp.unicode && flags.push('u');
    return flags.join('');
  }
}

export function unwrapGetter<T extends any>(
  getter: MaybeGetter<T, any>,
  value: any,
  index?: number
): T {
  if (getter instanceof Function) {
    return getter(value, index ?? 0);
  }
  return getter;
}
