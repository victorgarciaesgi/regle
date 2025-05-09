import { defineRegleConfig } from '@regle/core';
import { defineRegleNuxtPlugin } from '@regle/nuxt/setup';
import { required, withMessage } from '@regle/rules';

export default defineRegleNuxtPlugin(() => {
  return defineRegleConfig({
    rules: () => ({
      required: withMessage(required, 'Coucou Nuxt'),
      customRule: withMessage(required, 'Custom rule'),
    }),
  });
});
