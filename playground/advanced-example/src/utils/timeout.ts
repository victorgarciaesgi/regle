export function timeout(count: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, count);
  });
}

export function createTimeout() {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  function timeoutFn(count: number) {
    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise((resolve) => {
      timeout = null;
      timeout = setTimeout(resolve, count);
    });
  }

  return timeoutFn;
}
