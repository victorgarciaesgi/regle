import type { Options } from 'tsup';

export const defaultOptions: Options = {
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: false,
  sourcemap: true,
};
