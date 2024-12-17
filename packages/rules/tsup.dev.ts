import { defineConfig, type Options } from 'tsup';
import { defaultOptions, outExtension } from '../../tsup.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  dts: true,
  clean: false,
  external: ['vue', '@regle/core', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtension: outExtension(),
  },
]);
