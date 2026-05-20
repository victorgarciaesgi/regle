export function isRegleDevtoolsTestEnv(): boolean {
  return Boolean(
    typeof globalThis !== 'undefined' &&
    ('__vitest_worker__' in globalThis ||
      '__JEST_GLOBAL__' in globalThis ||
      (typeof window !== 'undefined' && 'Cypress' in window) ||
      (typeof process !== 'undefined' &&
        process.env &&
        (process.env.VITEST ||
          process.env.JEST_WORKER_ID ||
          process.env.NODE_ENV === 'test' ||
          process.env.PLAYWRIGHT_TEST)))
  );
}
