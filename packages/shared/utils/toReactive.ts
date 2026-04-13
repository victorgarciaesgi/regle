import type { Ref, UnwrapNestedRefs } from 'vue';
import { getCurrentInstance, isRef, nextTick, onMounted, reactive, ref, unref, type MaybeRef } from 'vue';

/**
 * Converts ref to reactive.
 *
 * @param objectRef A ref of object
 * @param isDisabled A ref to check if the object is disabled
 * @param onAccess A callback called before each proxy operation
 */
export function toReactive<T extends object>(
  objectRef: MaybeRef<T>,
  isDisabled: Ref<boolean>,
  onAccess?: () => void
): UnwrapNestedRefs<T> {
  if (!isRef(objectRef)) {
    onAccess?.();
    return reactive(objectRef);
  }
  const firstRun = ref(false);

  if (getCurrentInstance()) {
    onMounted(async () => {
      await nextTick();
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(() => {
          firstRun.value = true;
        });
      }
    });
  }

  const proxy = new Proxy(
    {},
    {
      get(_, p, receiver) {
        onAccess?.();
        if (isDisabled.value && p !== `$value` && firstRun.value) {
          return Reflect.get(_, p, receiver);
        }
        if (objectRef.value === undefined) return undefined;
        return unref(Reflect.get(objectRef.value, p, receiver));
      },
      set(_, p, value) {
        onAccess?.();
        if (isRef((objectRef.value as any)[p]) && !isRef(value)) (objectRef.value as any)[p].value = value;
        else (objectRef.value as any)[p] = value;
        return true;
      },
      deleteProperty(_, p) {
        onAccess?.();
        return Reflect.deleteProperty(objectRef.value, p);
      },
      has(_, p) {
        onAccess?.();
        if (objectRef.value === undefined) return false;
        return Reflect.has(objectRef.value, p);
      },
      ownKeys() {
        onAccess?.();
        if (objectRef.value === undefined) return [];
        return Object.keys(objectRef.value);
      },
      getOwnPropertyDescriptor() {
        onAccess?.();
        return {
          enumerable: true,
          configurable: true,
        };
      },
    }
  );

  return reactive(proxy) as UnwrapNestedRefs<T>;
}
