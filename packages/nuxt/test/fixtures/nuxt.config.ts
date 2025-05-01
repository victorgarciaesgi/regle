export default defineNuxtConfig({
  ssr: true,
  modules: ['../../src/module'],
  compatibilityDate: '2024-12-08',
  experimental: {
    externalVue: false,
  },
  imports: {
    autoImport: true,
  },
  regle: {
    setupFile: '~/regle/regle-setup.ts',
  },
});
