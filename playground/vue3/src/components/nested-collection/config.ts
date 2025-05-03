import { createScopedUseRegle, defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';

const { useRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'Coucou la global config'),
  }),
});

export const { useCollectScope, useScopedRegle } = createScopedUseRegle({ customUseRegle: useRegle, asRecord: true });
