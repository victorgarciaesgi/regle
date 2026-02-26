import type { Ref, UnwrapNestedRefs } from 'vue';
import { isRef, reactive, unref, type MaybeRef } from 'vue';

/**
 * Converts ref to reactive.
 *
 * @param objectRef A ref of object
 * @param isDisabled A ref to check if the object is disabled
 */
export function toReactive<T extends object>(objectRef: MaybeRef<T>, isDisabled: Ref<boolean>): UnwrapNestedRefs<T> {
  if (!isRef(objectRef)) return reactive(objectRef);

  const proxy = new Proxy(
    {},
    {
      get(_, p, receiver) {
        if (isDisabled.value && p !== `$value`) {
          return Reflect.get(_, p, receiver);
        }
        if (objectRef.value === undefined) return undefined;
        return unref(Reflect.get(objectRef.value, p, receiver));
      },
      set(_, p, value) {
        if (isRef((objectRef.value as any)[p]) && !isRef(value)) (objectRef.value as any)[p].value = value;
        else (objectRef.value as any)[p] = value;
        return true;
      },
      deleteProperty(_, p) {
        return Reflect.deleteProperty(objectRef.value, p);
      },
      has(_, p) {
        if (objectRef.value === undefined) return false;
        return Reflect.has(objectRef.value, p);
      },
      ownKeys() {
        if (objectRef.value === undefined) return [];
        return Object.keys(objectRef.value);
      },
      getOwnPropertyDescriptor() {
        return {
          enumerable: true,
          configurable: true,
        };
      },
    }
  );

  return reactive(proxy) as UnwrapNestedRefs<T>;
}
