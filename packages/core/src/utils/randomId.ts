function uniqueIDNuxt() {
  return Math.floor(Math.random() * Date.now()).toString();
}

export function randomId(): string {
  if (typeof window === 'undefined') {
    return uniqueIDNuxt();
  } else {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(10);
  }
}
