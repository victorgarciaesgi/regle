import { createScopedUseRegleSchema } from '@regle/schemas';

export const { useCollectScope: useScope1Validations, useScopedRegle: useScoped1Regle } = createScopedUseRegleSchema();
export const { useCollectScope: useScope2Validations, useScopedRegle: useScoped2Regle } = createScopedUseRegleSchema();

export const { useCollectScope: useScope5Validations, useScopedRegle: useScope5Regle } = createScopedUseRegleSchema({
  asRecord: true,
});
