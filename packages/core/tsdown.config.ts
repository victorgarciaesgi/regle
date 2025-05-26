import { defineConfig, type Options } from 'tsdown';
import { defaultOptions, outExtensions } from '../../tsdown.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  external: ['vue', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtensions: outExtensions(),
  },
  {
    ...sharedOptions,
    minify: true,
    outExtensions: outExtensions(true),
  },
]);
