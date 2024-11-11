import { defineConfig } from 'tsup';
import { defaultOptions } from '../../tsup.common.build';

export default defineConfig({
  ...defaultOptions,
  external: ['vue', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
});
