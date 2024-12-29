import type { EffectScope } from 'vue';
import { effectScope, type Ref } from 'vue';
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
