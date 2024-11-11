import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    resolve: true,
  },
  clean: true,
  external: ['vue', '@vue/reactivity', '@vue/runtime-core', '@vue/runtime-dom'],
  sourcemap: false,
});
