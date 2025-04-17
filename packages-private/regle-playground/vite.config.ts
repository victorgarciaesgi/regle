import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { execaSync } from 'execa';

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
    copyReglePlugin(),
  ],
  define: {
    __COMMIT__: JSON.stringify(commit),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(true),
  },
  optimizeDeps: {
    exclude: ['@vue/repl'],
  },
});

function copyReglePlugin(): Plugin {
  return {
    name: 'copy-pinia',
    generateBundle() {
      const copyFile = (file: string) => {
        const filePath = path.resolve(__dirname, file);
        const basename = path.basename(file);
        if (!fs.existsSync(filePath)) {
          throw new Error(`${basename} not built. ` + `Run "nr build`);
        }
        this.emitFile({
          type: 'asset',
          fileName: basename,
          source: fs.readFileSync(filePath, 'utf-8'),
        });
      };

      copyFile(`../core/dist/regle-core.mjs`);
      copyFile(`../rules/dist/regle-rules.mjs`);
      copyFile(`../schemas/dist/regle-schemas.mjs`);
    },
  };
}
