import { defineRegleConfig } from '@regle/core';
import { defineRegleNuxtPlugin } from '../../../../src/runtime/defineRegleNuxtPlugin';
import { required, withMessage } from '@regle/rules';

export default defineRegleNuxtPlugin(() => {
  return defineRegleConfig({
    rules: () => ({
      required: withMessage(required, 'Custom Nuxt error'),
      customRule: withMessage(required, 'Custom rule error'),
    }),
  });
});
