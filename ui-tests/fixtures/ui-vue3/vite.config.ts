import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite-plus';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  define: {
    __USE_DEVTOOLS__: true,
    __IS_DEV__: true,
  },
  plugins: [vueDevTools(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
