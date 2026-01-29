import type { EffectScope } from 'vue';
import { effectScope, type Ref } from 'vue';
import { isObject } from '../../../shared';
import type { MaybeGetter } from '../types';

/**
 * Checks if a Vue Ref is an object.
 *
 * @param obj - The Ref to check
 * @returns True if the Ref is an object, false otherwise
 */
export function isRefObject(obj: Ref<unknown>): obj is Ref<Record<string, any>> {
  return isObject(obj.value);
}

/**
 * Unwraps a collection ($each) getter function or returns the getter directly if it's not a function.
 *
 * @template T - The type of the getter function or the getter value
 * @param getter - The getter function or value to unwrap
 * @param value - The value to pass to the getter
 * @param index - The index to pass to the getter
 * @returns An object containing the scope and the unwrapped value
 */
export function unwrapGetter<T extends any>(
  getter: MaybeGetter<T, any, any, any>,
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
