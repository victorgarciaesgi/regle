import { RegleVuePlugin } from '@regle/core';
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(RegleVuePlugin);
});
