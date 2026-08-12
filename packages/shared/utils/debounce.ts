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
  /**
   * Callers waiting on a debounced run. A new call clears the previous timer, so the
   * superseded callers are settled together with the run that actually executes,
   * otherwise their promises would never settle.
   */
  let pendingCallbacks: { resolve: (value: any) => void; reject: (reason: any) => void }[] = [];

  function disableDebounceRef() {
    if (trackDebounceRef) {
      trackDebounceRef.value = false;
    }
  }

  function settleAll(settle: (callback: (typeof pendingCallbacks)[number]) => void) {
    const callbacks = pendingCallbacks;
    pendingCallbacks = [];
    callbacks.forEach(settle);
  }

  function customResolve(value: any) {
    settleAll((callback) => callback.resolve(value));
    disableDebounceRef();
  }

  function customReject(reason: any) {
    settleAll((callback) => callback.reject(reason));
    disableDebounceRef();
  }

  const debouncedFn: DebouncedFunction<T> = (...args) => {
    if (trackDebounceRef) {
      trackDebounceRef.value = true;
    }

    return new Promise((resolve, reject) => {
      pendingCallbacks.push({ resolve, reject });
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        disableDebounceRef();
        timeout = undefined;
        if (!immediate) {
          try {
            Promise.resolve(func.apply(this, [...args] as any))
              .then(customResolve)
              .catch(customReject)
              .finally(disableDebounceRef);
          } catch (e) {
            customReject(e);
          }
        }
      }, wait);
      if (immediate) {
        disableDebounceRef();
        try {
          Promise.resolve(func.apply(this, [...args] as any))
            .then(customResolve)
            .catch(customReject)
            .finally(disableDebounceRef);
        } catch (e) {
          customReject(e);
        }
      }
    });
  };

  debouncedFn.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
    // The cancelled run will never execute: settle its waiters with no value rather
    // than rejecting, as callers don't await `cancel`-able runs.
    customResolve(undefined);
  };

  return debouncedFn;
}
