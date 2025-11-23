import { defineConfig } from 'vitest/config';
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
  ...(process.env.TEST_DEBUG
    ? [
        {
          find: /^@regle\/(.*?)$/,
          replacement: fileURLToPath(new URL('./packages/$1/src', import.meta.url)),
        },
      ]
    : []),
];

export default defineConfig({
  define: {
    __USE_DEVTOOLS__: false,
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**'],
      exclude: ['**/*/index.ts', '**/types/**', '**/dist/**/*', '**/*.d.ts', '**/*.spec.ts', 'packages/nuxt/dist/**'],
    },
    projects: [
      {
        plugins: [vue()],
        extends: true,
        test: {
          alias,
          name: `Global tests - Vue ${vueVersion}.x`,
          root: './tests',
          environment: 'happy-dom',
          include: ['**/*.spec.ts'],
        },
      },
      {
        plugins: [vue()],
        extends: true,
        test: {
          alias,
          name: `Rules tests - Vue ${vueVersion}.x`,
          root: './packages/rules',
          environment: 'happy-dom',
          include: ['**/*.spec.ts'],
        },
      },
      {
        plugins: [vue()],
        extends: true,
        test: {
          alias,
          name: `Shared tests - Vue ${vueVersion}.x`,
          root: './packages/shared',
          environment: 'happy-dom',
          include: ['**/*.spec.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: `Nuxt tests - Vue ${vueVersion}.x`,
          root: './packages/nuxt',
          testTimeout: 30000,
          include: ['**/*.{spec,test}.ts'],
          pool: 'threads',
        },
      },
    ],
  },
});
