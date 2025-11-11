export class AbortError extends Error {
  constructor(message = 'Promise was aborted') {
    super(message);
    this.name = 'AbortError';
  }
}

export interface AbortablePromiseResult<T> {
  promise: Promise<T>;
  abort: (reason?: string) => void;
  signal: AbortSignal;
}

/**
 * Creates an abortable promise that can be cancelled using the returned abort function.
 */
export function abortablePromise<T>(input: Promise<T>): AbortablePromiseResult<T> {
  const controller = new AbortController();
  const { signal } = controller;

  const promise = new Promise<T>((resolve, reject) => {
    if (signal.aborted) {
      reject(new AbortError());
      return;
    }

    function abortHandler() {
      reject(new AbortError());
    }

    signal.addEventListener('abort', abortHandler);

    input
      .then((value) => {
        signal.removeEventListener('abort', abortHandler);
        if (!signal.aborted) {
          resolve(value);
        } else {
          reject(new AbortError());
        }
      })
      .catch((error) => {
        signal.removeEventListener('abort', abortHandler);
        if (!signal.aborted) {
          reject(error);
        } else {
          reject(new AbortError());
        }
      });
  });

  function abort(reason?: string) {
    controller.abort(reason);
  }

  return {
    promise,
    abort,
    signal,
  };
}
