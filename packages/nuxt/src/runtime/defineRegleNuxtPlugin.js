import { createScopedUseRegle } from '@regle/core';

/**
 * Define a Regle Nuxt plugin to provide global configuration for all forms in your Nuxt app.
 *
 * @param {() => { inferRules: any; useRegle: any }} setup - Setup function that returns a Regle config
 * @returns {{ inferRules: any; useRegle: any; useCollectScope: any; useScopedRegle: any }}
 *
 * @example
 * ```ts
 * // app/regle-config.ts
 * import { defineRegleNuxtPlugin } from '@regle/nuxt/setup';
 * import { defineRegleConfig } from '@regle/core';
 * import { required, withMessage } from '@regle/rules';
 *
 * export default defineRegleNuxtPlugin(() => {
 *   return defineRegleConfig({
 *     rules: () => {
 *       const { t } = useI18n();
 *       return {
 *         required: withMessage(required, t('general.required')),
 *         customRule: myCustomRule,
 *       };
 *     },
 *   });
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/integrations/nuxt Documentation}
 */
export function defineRegleNuxtPlugin(setup) {
  const { inferRules, useRegle } = setup();
  const { useCollectScope, useScopedRegle } = createScopedUseRegle({ customUseRegle: useRegle });
  return { inferRules, useRegle, useCollectScope, useScopedRegle };
}
