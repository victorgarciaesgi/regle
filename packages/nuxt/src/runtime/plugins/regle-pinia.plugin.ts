import { defineNuxtPlugin } from 'nuxt/app';
import type { Pinia } from 'pinia';

/**
 * Strips non-serializable properties from Pinia's Regle state.
 * Without this, SSR fails because `r$` contains functions, effect scopes, etc.
 * Uses `enforce: 'post'` to guarantee `$pinia` is available regardless of module order.
 */
export default defineNuxtPlugin({
  name: 'regle-pinia',
  enforce: 'post',
  async setup(nuxtApp) {
    const pinia = nuxtApp.$pinia as Pinia;
    if (!pinia) return;

    const REGLE_SYMBOL = Symbol.for('regle:instance');

    try {
      const { skipHydrate } = await import('pinia');

      pinia.use(({ store }) => {
        const state = pinia.state.value[store.$id];
        if (!state) return;

        for (const key of Object.keys(state)) {
          if (state[key] && typeof state[key] === 'object' && REGLE_SYMBOL in state[key]) {
            state[key] = skipHydrate(state[key]);
          }
        }
      });
    } catch (error) {
      console.error('Failed to import skipHydrate from pinia', { cause: error });
    }
  },
});
