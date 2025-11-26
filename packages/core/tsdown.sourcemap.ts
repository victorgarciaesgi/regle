import { defineConfig, type UserConfig } from 'tsdown';
import { defaultExternals, defaultOptions, outExtensions } from '../../tsdown.common.build.ts';

const sharedOptions: UserConfig = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: defaultExternals,
  sourcemap: true,
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtensions: outExtensions(),
  },
  {
    ...sharedOptions,
    minify: true,
    dts: false,
    outExtensions: outExtensions(true),
  },
]);
