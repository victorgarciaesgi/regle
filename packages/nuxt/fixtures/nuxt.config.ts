export default defineNuxtConfig({
  ssr: true,
  modules: ['@regle/nuxt'],
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
