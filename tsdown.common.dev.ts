import type { UserConfig } from 'vite-plus/pack';

export const defaultOptions: UserConfig = {
  format: ['esm'],
  ignoreWatch: ['dist', '.turbo'],
  dts: true,
  clean: false,
  sourcemap: true,
  outExtensions: () => ({ js: '.js' }),
};
