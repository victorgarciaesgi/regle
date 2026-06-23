import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const root = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const fixtureDir = path.join(root, 'scripts/size-limit-consumer');
const target = process.env.SIZE_LIMIT_TARGET;

if (target !== 'core' && target !== 'rules') {
  throw new Error('SIZE_LIMIT_TARGET must be "core" or "rules"');
}

export default defineConfig({
  define: {
    __USE_DEVTOOLS__: 'false',
    __IS_DEV__: 'false',
  },
  resolve: {
    alias: {
      '@regle/core': path.join(root, 'packages/core'),
      '@regle/rules': path.join(root, 'packages/rules'),
    },
    conditions: ['production', 'import', 'module', 'default'],
  },
  build: {
    outDir: path.join(fixtureDir, 'dist', target),
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      input: path.join(fixtureDir, `main-${target}.ts`),
      external: ['vue'],
      output: {
        entryFileNames: `${target}.js`,
        format: 'es',
      },
    },
  },
});
