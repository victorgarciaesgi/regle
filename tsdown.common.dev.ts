import type { Options } from 'tsdown';

export const defaultOptions: Options = {
  format: ['esm'],
  ignoreWatch: ['dist/**'],
  dts: true,
  clean: false,
  sourcemap: true,
  workspace: {
    exclude: ['tests', 'packages/shared'],
  },
};
