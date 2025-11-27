export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },
  compatibilityDate: '2025-02-19',
  modules: ['@regle/nuxt', '@pinia/nuxt'],
});
