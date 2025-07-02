import { defineWorkspace } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import type { AliasOptions } from 'vite';
import { fileURLToPath } from 'node:url';

const vueVersion = (process.env.VUE_VERSION as '3.4' | '3.5') ?? '3.5';

const alias: AliasOptions = [
  ...(vueVersion === '3.4'
    ? [
        {
          find: 'vue',
          replacement: 'vue-3.4',
        },
        {
          find: 'pinia',
          replacement: 'pinia-2.2.5',
        },
      ]
    : []),
  {
    find: /^@regle\/(.*?)$/,
    replacement: fileURLToPath(new URL('./packages/$1/src', import.meta.url)),
  },
];

export default defineWorkspace([
  {
    plugins: [vue()],
    test: {
      alias,
      name: `Global tests - Vue ${vueVersion}.x`,
      root: './tests',
      globals: true,
      testTimeout: 1000,
      environment: 'happy-dom',
      include: ['**/*.spec.ts'],
    },
  },
  {
    plugins: [vue()],
    test: {
      alias,
      name: `Rules tests - Vue ${vueVersion}.x`,
      root: './packages/rules',
      globals: true,
      testTimeout: 1000,
      environment: 'happy-dom',
      include: ['**/*.spec.ts'],
    },
  },
  {
    plugins: [vue()],
    test: {
      alias,
      name: `Shared tests - Vue ${vueVersion}.x`,
      root: './packages/shared',
      globals: true,
      testTimeout: 1000,
      environment: 'happy-dom',
      include: ['**/*.spec.ts'],
    },
  },
  {
    test: {
      name: `Nuxt tests - Vue ${vueVersion}.x`,
      root: './packages/nuxt',
      globals: true,
      include: ['**/*.{spec,test}.ts'],
    },
  },
]);
