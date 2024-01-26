import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    testTimeout: 10000,
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**'],
      exclude: ['**/index.ts', '**/types/**', '**/*.d.ts'],
    },
    include: ['./tests/**/*.spec.ts', './packages/**/*.spec.ts'],
  },
});
