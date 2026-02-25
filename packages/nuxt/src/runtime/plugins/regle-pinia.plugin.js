import { defineNuxtPlugin } from 'nuxt/app';

/**
 * Marks Regle instances with Pinia's skipHydrate so SSR payload
 * doesn't try to serialize non-serializable internals.
 */
export default defineNuxtPlugin({
  name: 'regle-pinia',
  enforce: 'post',
  async setup(nuxtApp) {
    const pinia = nuxtApp.$pinia;

    if (!pinia) return;

    const REGLE_SYMBOL = Symbol.for('regle:instance');

    try {
      const { skipHydrate } = await import('pinia');

      pinia.use(({ store }) => {
        const state = pinia.state.value[store.$id];
        if (!state && typeof state !== 'object') return;

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
