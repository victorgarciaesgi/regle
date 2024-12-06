import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**', 'packages/*/dist/**'],
      exclude: ['**/index.ts', '**/types/**', '**/*.d.ts', '**/*.spec.ts', 'packages/nuxt/dist/**'],
    },
  },
});
