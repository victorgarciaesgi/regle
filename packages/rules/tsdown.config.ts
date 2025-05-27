import { defineConfig, type Options } from 'tsdown';
import { defaultOptions, outExtensions } from '../../tsdown.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  external: ['vue', '@regle/core', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
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
