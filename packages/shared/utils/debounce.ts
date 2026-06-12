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
  // Promises of calls that were superseded before their timer fired. They are
  // collapsed onto the trailing execution so they always settle (a debounced call
  // must never leave its promise hanging forever).
  let pending: { resolve: (value: any) => void; reject: (reason?: any) => void }[] = [];

  const setDebounceRef = (value: boolean) => {
    if (trackDebounceRef) {
      trackDebounceRef.value = value;
    }
  };

  const debouncedFn: DebouncedFunction<T> = (...args) => {
    setDebounceRef(true);

    return new Promise((resolve, reject) => {
      pending.push({ resolve, reject });
      clearTimeout(timeout);

      const run = () => {
        const settled = pending;
        pending = [];
        timeout = undefined;
        setDebounceRef(false);
        try {
          Promise.resolve(func.apply(this, args as any))
            .then((value) => settled.forEach((p) => p.resolve(value)))
            .catch((e) => settled.forEach((p) => p.reject(e)))
            .finally(() => setDebounceRef(false));
        } catch (e) {
          settled.forEach((p) => p.reject(e));
        }
      };

      if (immediate) {
        run();
      } else {
        timeout = setTimeout(run, wait);
      }
    });
  };

  debouncedFn.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
    const settled = pending;
    pending = [];
    // Settle any in-flight promises so awaiting callers don't hang on a cancel.
    settled.forEach((p) => p.resolve(undefined));
    setDebounceRef(false);
  };

  return debouncedFn;
}
