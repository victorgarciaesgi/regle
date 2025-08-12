import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';
import { outExtensions } from '../../tsdown.common.build.ts';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  external: ['vue', '@regle/core', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
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
