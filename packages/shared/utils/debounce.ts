import type { Ref } from 'vue';

export interface DebouncedFunction<T extends (...args: any[]) => any | Promise<any>> {
  (...args: Parameters<T>): Promise<ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>>;
  cancel(): void;
}

export function debounce<T extends (...args: any[]) => any | Promise<any>>(
  this: any,
  func: T,
  wait: number,
  { immediate = false, trackDebounceRef }: { immediate?: boolean; trackDebounceRef?: Ref<boolean> } = {}
): DebouncedFunction<T> {
  let timeout: NodeJS.Timeout | undefined;
  const debouncedFn: DebouncedFunction<T> = (...args) => {
    if (trackDebounceRef) {
      trackDebounceRef.value = true;
    }

    function disableDebounceRef() {
      if (trackDebounceRef) {
        trackDebounceRef.value = false;
      }
    }

    return new Promise((resolve, reject) => {
      function customResolve(value: any) {
        resolve(value);
        disableDebounceRef();
      }
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        disableDebounceRef();
        timeout = undefined;
        if (!immediate) {
          try {
            Promise.resolve(func.apply(this, [...args] as any))
              .then(customResolve)
              .catch((e) => reject(e))
              .finally(disableDebounceRef);
          } catch (e) {
            reject(e);
          }
        }
      }, wait);
      if (immediate) {
        disableDebounceRef();
        try {
          Promise.resolve(func.apply(this, [...args] as any))
            .then(customResolve)
            .catch((e) => reject(e))
            .finally(disableDebounceRef);
        } catch (e) {
          reject(e);
        }
      }
    });
  };

  debouncedFn.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
    if (trackDebounceRef) {
      trackDebounceRef.value = false;
    }
  };

  return debouncedFn;
}
