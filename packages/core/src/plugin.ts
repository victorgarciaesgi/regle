import type { App, Plugin } from 'vue';
import { version } from '../package.json';
import { createDevtools } from './devtools/devtools';
import { regleSymbol } from './constants';

export const RegleVuePlugin: Plugin = {
  install(app) {
    app.provide(regleSymbol, version);

    if (typeof window !== 'undefined' && __USE_DEVTOOLS__) {
      // Handles devtools in the vue playground
      window.addEventListener('message', (event) => {
        // @ts-expect-error Custom window property
        window.VUE_DEVTOOLS_CONFIG = {
          defaultSelectedAppId: 'repl',
        };

        if (event.data.event === 'regle-devtools-repl') {
          const iframe = document.querySelector('iframe');
          const iframeApp = iframe?.contentWindow?.document.querySelector('[data-v-app]' as any)?.__vue_app__;
          if (iframeApp) {
            const map: Map<string, App> = iframeApp.__VUE_DEVTOOLS_NEXT_APP_RECORD__.instanceMap;
            // Filter out entries in 'map' where the key is null
            for (const [key] of map) {
              if (key == null) {
                map.delete(key);
              }
            }
            createDevtools(iframeApp, true);
          }
        }
      });
      createDevtools(app);
    }
  },
};
