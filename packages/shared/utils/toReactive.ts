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

  // Dedicated target so Object.defineProperty (e.g. Pinia's skipHydrate) can
  // attach markers that Object.hasOwn / shouldHydrate can read without trap errors.
  const target: Record<PropertyKey, unknown> = {};
  const proxy = new Proxy(target, {
    get(_, p, receiver) {
      onAccess?.();
      if (Reflect.getOwnPropertyDescriptor(target, p)) {
        return Reflect.get(target, p, receiver);
      }
      if (isDisabled.value && p !== `$value` && firstRun.value) {
        return Reflect.get(target, p, receiver);
      }
      if (objectRef.value === undefined) return undefined;
      return unref(Reflect.get(objectRef.value, p, receiver));
    },
    set(_, p, value) {
      onAccess?.();
      if (Reflect.getOwnPropertyDescriptor(target, p)) {
        return Reflect.set(target, p, value);
      }
      if (isRef((objectRef.value as any)[p]) && !isRef(value)) (objectRef.value as any)[p].value = value;
      else (objectRef.value as any)[p] = value;
      return true;
    },
    deleteProperty(_, p) {
      onAccess?.();
      if (Reflect.getOwnPropertyDescriptor(target, p)) {
        return Reflect.deleteProperty(target, p);
      }
      return Reflect.deleteProperty(objectRef.value, p);
    },
    has(_, p) {
      onAccess?.();
      if (Reflect.has(target, p)) return true;
      if (objectRef.value === undefined) return false;
      return Reflect.has(objectRef.value, p);
    },
    ownKeys() {
      onAccess?.();
      const fromRef = objectRef.value === undefined ? [] : Object.keys(objectRef.value);
      return [...new Set([...fromRef, ...Reflect.ownKeys(target)])];
    },
    getOwnPropertyDescriptor(_, p) {
      onAccess?.();
      const fromTarget = Reflect.getOwnPropertyDescriptor(target, p);
      if (fromTarget) return fromTarget;
      if (objectRef.value === undefined || !Reflect.has(objectRef.value, p)) {
        return undefined;
      }
      return {
        enumerable: true,
        configurable: true,
        get: () => unref(Reflect.get(objectRef.value, p)),
        set: (value: unknown) => {
          if (isRef((objectRef.value as any)[p]) && !isRef(value)) (objectRef.value as any)[p].value = value;
          else (objectRef.value as any)[p] = value;
        },
      };
    },
    defineProperty(_, p, attributes) {
      onAccess?.();
      return Reflect.defineProperty(target, p, attributes);
    },
  });

  return reactive(proxy) as UnwrapNestedRefs<T>;
}
