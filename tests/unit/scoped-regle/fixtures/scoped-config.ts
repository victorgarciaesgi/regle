import { createScopedUseRegle, defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';

const { useRegle } = defineRegleConfig({
  rules: () => ({
    myCustomRule: withMessage(required, 'Custom error'),
  }),
});

export const { useCollectScope: useScope1Validations, useScopedRegle: useScoped1Regle } = createScopedUseRegle();
export const { useCollectScope: useScope2Validations, useScopedRegle: useScoped2Regle } = createScopedUseRegle();
export const { useCollectScope: useScope3Validations, useScopedRegle: useScoped3Regle } = createScopedUseRegle({
  customUseRegle: useRegle,
});

export const { useCollectScope: useScope5Validations, useScopedRegle: useScope53Regle } = createScopedUseRegle({
  asRecord: true,
});
