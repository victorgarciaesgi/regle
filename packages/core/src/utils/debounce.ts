interface DebouncedFunction {
  (...args: unknown[]): Promise<unknown>;
  cancel(): void;
  doImmediately(...args: unknown[]): Promise<unknown>;
}

export function debounce<T extends (...args: any[]) => any | Promise<any>>(
  this: any,
  func: T,
  wait: number,
  immediate?: boolean
): T {
  let timeout: NodeJS.Timeout | undefined;
  const debouncedFn: DebouncedFunction = (...args) =>
    new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = undefined;
        if (!immediate) {
          Promise.resolve(func.apply(this, [...args] as any)).then(resolve);
        }
      }, wait);
      if (immediate && !timeout) {
        Promise.resolve(func.apply(this, [...args] as any)).then(resolve);
      }
    });

  debouncedFn.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };

  debouncedFn.doImmediately = (...args) =>
    new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        timeout = undefined;
        Promise.resolve(func.apply(this, [...args] as any)).then(resolve);
      }, 0);
    });

  return debouncedFn as unknown as T;
}
