import type { Plugin } from 'vue';
import { setupDevtoolsPlugin } from './devtools';

export const RegleVuePlugin: Plugin = {
  install(app) {
    if (typeof window !== 'undefined') {
      setupDevtoolsPlugin(app);
    }
  },
};
