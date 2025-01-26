import { defineWorkspace } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const vueVersion = process.env.VUE_VERSION ?? '3.5';
const testTypes = process.env.TEST_TYPES != null ? (process.env.TEST_TYPES === 'true' ? true : false) : true;

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
    plugins: [vue() as any],
    test: {
      name: `Global tests - Vue ${vueVersion}.x`,
      root: './tests',
      globals: true,
      testTimeout: 10000,
      environment: 'happy-dom',
      include: ['./tests/**/*.spec.ts'],
      typecheck: {
        enabled: testTypes,
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
    plugins: [vue() as any],
    test: {
      name: `Rules tests - Vue ${vueVersion}.x`,
      root: './packages/rules',
      globals: true,
      testTimeout: 10000,
      environment: 'happy-dom',
      include: ['./packages/rules/**/*.spec.ts'],
      typecheck: {
        enabled: testTypes,
        include: ['**/*.{test,spec}(-d)?.?(c|m)[jt]s?(x)'],
        ignoreSourceErrors: true,
        checker: 'vue-tsc',
      },
    },
  },
  {
    test: {
      name: `Nuxt tests - Vue ${vueVersion}.x`,
      root: './packages/nuxt',
      globals: true,
      include: ['test/**/*.{spec,test}.ts'],
    },
  },
]);
