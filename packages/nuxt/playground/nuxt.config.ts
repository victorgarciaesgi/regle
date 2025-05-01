import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  regle: {
    setupFile: '~/regle/regle-setup.ts',
  },
});
