import MyModule from '../../src/module';

export default defineNuxtConfig({
  ssr: true,
  modules: [MyModule],
  compatibilityDate: '2024-12-08',
  experimental: {
    externalVue: false,
  },
  imports: {
    autoImport: true,
  },
});
