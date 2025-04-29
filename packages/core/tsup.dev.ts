import { defineConfig, type Options } from 'tsup';
import { defaultOptions } from '../../tsup.common.dev';
import { outExtension } from '../../tsup.common.build';

const sharedOptions: Options = {
  ...defaultOptions,
  entry: { 'regle-core': 'src/index.ts' },
  dts: false,
  clean: false,
  external: ['vue', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
  ignoreWatch: ['dist/**'],
  sourcemap: false,
};

export default defineConfig([
  {
    ...sharedOptions,
    outExtension: outExtension(),
  },
]);
