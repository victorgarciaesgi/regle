import type { Plugin } from 'vue';
import { version } from '../package.json';
import { createDevtools } from './devtools/devtools';
import { regleSymbol } from './constants';

/**
 * Vue plugin to enable Regle devtools integration with Vue Devtools.
 * Provides debugging capabilities for inspecting validation trees, states, and actions.
 *
 * Supports inspection of: `useRegle`, `useRules`, `useRegleSchema`, `useScopedRegle`, `useScopedRegleSchema`.
 *
 * Note: If using `@regle/nuxt`, devtools are automatically enabled.
 *
 * @example
 * ```ts
 * // main.ts
 * import { createApp } from 'vue';
 * import { RegleVuePlugin } from '@regle/core';
 * import App from './App.vue';
 *
 * const app = createApp(App);
 * app.use(RegleVuePlugin);
 * app.mount('#app');
 * ```
 *
 * @see {@link https://reglejs.dev/introduction/devtools Documentation}
 */
export const RegleVuePlugin: Plugin = {
  install(app) {
    app.provide(regleSymbol, version);

    if (typeof window !== 'undefined' && __USE_DEVTOOLS__) {
      createDevtools(app);
    }
  },
};
