import { defineConfig, type UserConfig } from 'tsdown';
import { defaultExternals, defaultOptions, outExtensions } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  external: [...defaultExternals, '@regle/core'],
};

export default defineConfig([
  sharedOptions,
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    outExtensions: outExtensions(true),
  },
]);
