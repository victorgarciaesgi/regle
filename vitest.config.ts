import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import type { AliasOptions } from 'vite';

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
  ...(process.env.TEST_TRACE
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
    __IS_DEV__: false,
  },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**', 'packages/*/utils/**'],
      exclude: [
        '**/*/index.ts',
        '**/types/**',
        '**/dist/**/*',
        '**/*.d.ts',
        '**/*.spec.ts',
        'packages/mcp-server/**',
        'packages/nuxt/src/module.ts',
        'packages/nuxt/src/runtime/plugins/regle.plugin.js',
        'packages/nuxt/dist/**',
        'packages/core/src/devtools/**',
        'packages/core/src/plugin.ts',
      ],
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
          name: `Core tests - Vue ${vueVersion}.x`,
          root: './packages/core',
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
