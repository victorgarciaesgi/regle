import { defineConfig, type UserConfig } from 'tsdown';
import { defaultExternals, defaultOptions, outExtensions } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-schemas': 'src/index.ts' },
  external: [...defaultExternals, '@regle/core'],
  sourcemap: true,
};

export default defineConfig([
  {
    ...sharedOptions,
  },
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    outExtensions: outExtensions(true),
  },
]);
