import { defineConfig, type Options } from 'tsup';
import { defaultOptions, outExtension } from '../../tsup.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  external: ['vue', '@regle/core', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
  sourcemap: 'inline',
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtension: outExtension(),
  },
  {
    ...sharedOptions,
    minify: true,
    outExtension: outExtension(true),
  },
]);
