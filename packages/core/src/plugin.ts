import type { Plugin } from 'vue';
import { version } from '../package.json';
import { createDevtools } from './devtools/devtools';
import { regleSymbol } from './constants';

export const RegleVuePlugin: Plugin = {
  install(app) {
    app.provide(regleSymbol, version);

    if (typeof window !== 'undefined' && __USE_DEVTOOLS__) {
      createDevtools(app);
    }
  },
};
