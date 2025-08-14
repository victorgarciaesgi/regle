import { createScopedUseRegle } from '@regle/core';
export function defineRegleNuxtPlugin(setup) {
  const { inferRules, useRegle } = setup();
  const { useCollectScope, useScopedRegle } = createScopedUseRegle({ customUseRegle: useRegle });
  return { inferRules, useRegle, useCollectScope, useScopedRegle };
}
