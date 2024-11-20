import type { Options } from 'tsup';

export const defaultOptions: Options = {
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: false,
  treeshake: true,
};
