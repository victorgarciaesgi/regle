import vue from '@vitejs/plugin-vue';
import { execaSync } from 'execa';
import fs from 'node:fs';
import { defineConfig } from 'vite';

const commit = execaSync('git', ['rev-parse', '--short', 'HEAD']);

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        fs: {
          fileExists: fs.existsSync,
          readFile: (file) => fs.readFileSync(file, 'utf-8'),
        },
      },
    }),
  ],
  define: {
    __COMMIT__: JSON.stringify(commit),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
  },
  optimizeDeps: {
    exclude: ['@vue/repl'],
  },
});
