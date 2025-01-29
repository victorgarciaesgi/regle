import { defineConfig } from 'vitest/config';

const vueVersion = process.env.VUE_VERSION ?? '3.5';

const alias = {
  ...(vueVersion === '3.4' && {
    vue: 'vue3.4',
    '@vue/reactivity': '@vue/reactivity3.4',
    '@vue/runtime-core': '@vue/runtime-core3.4',
    '@vue/runtime-dom': '@vue/runtime-dom3.4',
    '@vue/shared': '@vue/shared3.4',
    '@vue/compiler-dom': '@vue/compiler-dom3.4',
    '@vue/server-renderer': '@vue/server-renderer3.4',
    pinia: 'pinia2.2.5',
  }),
};

export default defineConfig({
  resolve: {
    alias,
    preserveSymlinks: true,
  },
  test: {
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**', 'packages/*/dist/**'],
      exclude: ['**/index.ts', '**/types/**', '**/dist/**/*.cjs', '**/*.d.ts', '**/*.spec.ts', 'packages/nuxt/dist/**'],
    },
  },
});
