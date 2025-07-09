import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    testTimeout: 1000,
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**'],
      exclude: ['**/*/index.ts', '**/types/**', '**/dist/**/*', '**/*.d.ts', '**/*.spec.ts', 'packages/nuxt/dist/**'],
    },
  },
});
