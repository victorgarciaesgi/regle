import { defineWorkspace } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

const vueVersion = (process.env.VUE_VERSION as '3.4' | '3.5') ?? '3.5';
const testTypes = process.env.TEST_TYPES != null ? (process.env.TEST_TYPES === 'true' ? true : false) : true;

export default defineWorkspace([
  {
    plugins: [vue()],
    test: {
      name: `Global tests - Vue ${vueVersion}.x`,
      root: './tests',
      globals: true,
      pool: 'vmForks',
      testTimeout: 1000,
      environment: 'happy-dom',
      include: ['**/*.spec.ts'],
      typecheck: {
        enabled: testTypes,
        include: ['**/*.{test,spec}(-d)?.?(c|m)[jt]s?(x)'],
        ignoreSourceErrors: true,
        checker: 'vue-tsc',
      },
    },
  },

  {
    plugins: [vue()],
    test: {
      name: `Rules tests - Vue ${vueVersion}.x`,
      root: './packages/rules',
      globals: true,
      testTimeout: 1000,
      environment: 'happy-dom',
      include: ['**/*.spec.ts'],
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
