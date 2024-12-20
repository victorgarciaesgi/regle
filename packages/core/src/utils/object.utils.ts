import type { EffectScope } from 'vue';
import { effectScope, isRef, unref, type MaybeRef, type Ref } from 'vue';
import type { MaybeGetter } from '../types';

export function isObject(obj: unknown): obj is Record<string, any> {
  if (obj instanceof Date || obj instanceof File) {
    return false;
  }
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isRefObject(obj: Ref<unknown>): obj is Ref<Record<string, any>> {
  if (obj.value instanceof Date || obj.value instanceof File) {
    return false;
  }
  return isObject(obj.value);
}

export function cloneDeep<T>(obj: T): T {
  let result = obj as any;
  let type = {}.toString.call(obj).slice(8, -1);
  if (type == 'Set') {
    result = new Set([...(obj as any)].map((value) => cloneDeep(value)));
  }
  if (type == 'Map') {
    result = new Map([...(obj as any)].map((kv) => [cloneDeep(kv[0]), cloneDeep(kv[1])]));
  }
  if (type == 'Date') {
    result = new Date((obj as any).getTime());
  }
  if (type == 'RegExp') {
    result = RegExp((obj as any).source, getRegExpFlags(obj));
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
  value: Ref<any>,
  index?: number
): { scope: EffectScope; unwrapped: T } {
  const scope = effectScope();
  let unwrapped: T;
  if (getter instanceof Function) {
    unwrapped = scope.run(() => getter(value, index ?? 0))!;
  } else {
    unwrapped = getter;
  }

  return { scope, unwrapped };
}
