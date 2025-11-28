import { createScopedUseRegle } from '@regle/core';

export const { useCollectScope, useScopedRegle } = createScopedUseRegle({
  asRecord: true,
});
