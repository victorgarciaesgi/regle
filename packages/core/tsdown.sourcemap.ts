import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.build';
import { outExtensions } from '../../tsdown.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: ['vue', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
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
