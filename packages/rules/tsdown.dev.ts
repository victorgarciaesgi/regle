import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-rules': 'src/index.ts' },
  dts: true,
  clean: false,
  external: ['vue', '@regle/core', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
  watch: ['./src', '../shared/utils'],
};

export default defineConfig([
  {
    ...sharedOptions,
  },
]);
