import type { Resolver } from '@nuxt/kit';
import type { Nuxt } from 'nuxt/schema';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const REGLE_DEVTOOLS_UI_ROUTE = '/__regle';
export const REGLE_DEVTOOLS_UI_LOCAL_PORT = 3301;

export function setupDevToolsUI(nuxt: Nuxt, resolver: Resolver) {
  const builtClientPath = resolver.resolve('../dist/client');
  const sourceClientPath = resolver.resolve('./client');
  const clientPath = existsSync(join(builtClientPath, 'index.html')) ? builtClientPath : sourceClientPath;
  const isProductionBuild = existsSync(join(clientPath, 'index.html'));

  if (isProductionBuild) {
    nuxt.hook('vite:serverCreated', async (server) => {
      const sirv = (await import('sirv').then((module) => module.default || module)) as typeof import('sirv').default;
      server.middlewares.use(REGLE_DEVTOOLS_UI_ROUTE, sirv(clientPath, { dev: true, single: true }));
    });
  } else {
    nuxt.hook('vite:extendConfig', (config) => {
      config.server = config.server || {};
      config.server.proxy = config.server.proxy || {};
      config.server.proxy[REGLE_DEVTOOLS_UI_ROUTE] = {
        target: `http://localhost:${REGLE_DEVTOOLS_UI_LOCAL_PORT}${REGLE_DEVTOOLS_UI_ROUTE}`,
        changeOrigin: true,
        followRedirects: true,
        rewrite: (path) => path.replace(REGLE_DEVTOOLS_UI_ROUTE, ''),
      };
    });
  }

  nuxt.hook('devtools:customTabs', (tabs) => {
    tabs.push({
      name: 'regle',
      title: 'Regle',
      icon: 'https://reglejs.dev/logo_main.png',
      category: 'modules',
      view: {
        type: 'iframe',
        src: REGLE_DEVTOOLS_UI_ROUTE,
      },
    });
  });
}
