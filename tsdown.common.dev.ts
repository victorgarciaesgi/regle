import type { Options } from 'tsdown';

export const defaultOptions: Options = {
  format: ['esm'],
  ignoreWatch: ['dist', '.turbo'],
  dts: true,
  clean: false,
  sourcemap: true,
};
