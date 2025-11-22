import type { Plugin } from 'vue';
import { createDevtools } from './devtools';

const __USE_DEVTOOLS__: boolean = process.env.NODE_ENV === 'development';
const regleSymbol = Symbol('regle');

export const RegleVuePlugin: Plugin = {
  install(app) {
    app.provide(regleSymbol, true);

    if (typeof window !== 'undefined' && __USE_DEVTOOLS__) {
      createDevtools(app);
    }
  },
};
