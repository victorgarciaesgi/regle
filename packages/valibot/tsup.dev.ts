import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: false,
  clean: false,
  external: ['vue', 'valibot', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
});
