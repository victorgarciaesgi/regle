import { createScopedUseRegle, defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';
import { ref } from 'vue';

const { useRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'Custom error from config'),
    customRule: withMessage(required, 'Custom error'),
  }),
});

export const { useCollectScopedValidations: useScope1Validations, useScopedRegle: useScoped1Regle } =
  createScopedUseRegle();
export const { useCollectScopedValidations: useScope2Validations, useScopedRegle: useScoped2Regle } =
  createScopedUseRegle();
export const { useCollectScopedValidations: useScope3Validations, useScopedRegle: useScoped3Regle } =
  createScopedUseRegle({
    customUseRegle: useRegle,
  });
