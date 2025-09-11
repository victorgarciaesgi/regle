import { defineConfig, type Options } from 'tsdown';
import { defaultOptions } from '../../tsdown.common.dev.ts';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  dts: true,
  external: ['vue', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
  ignoreWatch: ['dist/**'],
  sourcemap: true,
  watch: ['./src', '../shared/utils'],
};

export default defineConfig([
  {
    ...sharedOptions,
  },
]);
