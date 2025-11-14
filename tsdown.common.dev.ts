import type { UserConfig } from 'tsdown';

export const defaultOptions: UserConfig = {
  format: ['esm'],
  ignoreWatch: ['dist', '.turbo'],
  dts: true,
  clean: false,
  sourcemap: true,
};
