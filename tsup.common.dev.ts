import type { Options } from 'tsup';

export const defaultOptions: Options = {
  format: ['esm'],
  dts: true,
  clean: false,
  sourcemap: true,
};
