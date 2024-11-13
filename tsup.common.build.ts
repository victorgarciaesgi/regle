import type { Options } from 'tsup';

export const defaultOptions: Options = {
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: false,
  treeshake: true,
};
