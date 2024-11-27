import { isRef, unref, type MaybeRef, type Ref } from 'vue';
import type { MaybeGetter } from '../types';

export function isObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}

export function isRefObject(obj: Ref<unknown>): obj is Ref<Record<string, any>> {
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
): T {
  if (getter instanceof Function) {
    return getter(value, index ?? 0);
  }
  return getter;
}

export function resetFieldValue(current: MaybeRef<any>, initial: any) {
  if (isRef(current)) {
    current.value = initial;
  } else {
    current = initial;
  }
}

export function resetArrayValuesRecursively(current: MaybeRef<any[]>, initial: any[]) {
  if (isRef(current)) {
    current.value = [];
  } else {
    current = [];
  }
  initial.forEach((val, index) => {
    let currentRef = isRef(current) ? current.value[index] : current[index];
    currentRef = {};
    resetValuesRecursively(currentRef, initial[index]);
  });
}

export function resetValuesRecursively(
  current: Ref<Record<string, MaybeRef<any>>> | Record<string, MaybeRef<any>>,
  initial: Record<string, MaybeRef<any>>
) {
  Object.entries({ ...unref(current), ...initial }).forEach(([key, value]) => {
    let currentRef = isRef<Record<string, MaybeRef<any>>>(current) ? current.value : current;
    let initialRef = isRef(initial[key]) ? (initial[key] as any)._value : initial[key];
    let currentValue = isRef(currentRef[key]) ? currentRef[key].value : currentRef[key];
    if (Array.isArray(currentRef[key])) {
      currentRef[key] = [];
      if (Array.isArray(initialRef)) {
        initialRef.forEach((val, index) => {
          currentRef[key][index] = {};
          resetValuesRecursively(currentRef[key][index], initialRef[index]);
        });
      }
    } else if (isObject(initialRef)) {
      resetValuesRecursively(currentValue, initialRef);
    } else {
      if (isRef(currentRef[key])) {
        currentRef[key].value = initialRef;
      } else {
        currentRef[key] = initialRef;
      }
    }
  });
}
