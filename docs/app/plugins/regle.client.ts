import { createPinia } from 'pinia';
import { RegleVuePlugin } from '@regle/core';

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia();
  nuxtApp.vueApp.use(pinia);
  nuxtApp.vueApp.use(RegleVuePlugin);
});
