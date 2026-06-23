import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  ssr: true,
  modules: ['@pinia/nuxt', '@regle/nuxt'],
  compatibilityDate: '2024-12-08',
  experimental: {
    externalVue: false,
  },
  imports: {
    autoImport: true,
  },
  regle: {
    setupFile: '~/regle-config.ts',
  },
  vite: {
    optimizeDeps: {
      include: ['check-password-strength'],
    },
  },
});
