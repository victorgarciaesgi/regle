import { defineConfig, type UserConfig } from 'tsdown';
import { defaultOptions, outExtensions, defaultExternals } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: defaultExternals,
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
