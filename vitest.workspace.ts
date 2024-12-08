import { defineWorkspace } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineWorkspace([
  {
    plugins: [vue()],
    test: {
      globals: true,
      testTimeout: 10000,
      environment: 'happy-dom',
      include: ['./packages/**/*.spec.ts', './tests/**/*.spec.ts'],
      exclude: ['./packages/nuxt/**'],
      typecheck: {
        enabled: true,
        include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)'],
        ignoreSourceErrors: true,
      },
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
