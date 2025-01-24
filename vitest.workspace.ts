import { defineWorkspace } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

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

export default defineWorkspace([
  {
    plugins: [vue()],
    test: {
      name: `Vue ${vueVersion}.x`,
      globals: true,
      testTimeout: 10000,
      environment: 'happy-dom',
      include: ['./packages/**/*.spec.ts', './tests/**/*.spec.ts'],
      exclude: ['./packages/nuxt/**', 'packages/**/node_modules/**'],
      typecheck: {
        enabled: true,
        include: ['**/*.{test,spec}(-d)?.?(c|m)[jt]s?(x)'],
        ignoreSourceErrors: true,
        checker: 'vue-tsc',
      },
    },
    resolve: {
      alias,
    },
  },
  {
    test: {
      name: '@regle/nuxt',
      root: './packages/nuxt',
      include: ['test/**/*.{spec,test}.ts'],
    },
  },
]);
