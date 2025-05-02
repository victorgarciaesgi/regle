import type { ScopedInstancesRecordLike, useCollectScope, MergedScopedRegles } from '@regle/core';
import { createScopedUseRegle } from '@regle/core';
import { useRegleSchema, type useRegleSchemaFn } from './useRegleSchema';
import type { MaybeRefOrGetter, Ref } from 'vue';

export const { useCollectScope: useCollectSchemaScope, useScopedRegle: useScopedRegleSchema } = createScopedUseRegle({
  customUseRegle: useRegleSchema as any,
}) as unknown as { useCollectScope: typeof useCollectScope; useScopedRegle: typeof useRegleSchema };

export const createScopedUseRegleSchema = <
  TCustomRegle extends useRegleSchemaFn = useRegleSchemaFn,
  TReturnedRegle extends useRegleSchemaFn = TCustomRegle extends useRegleSchemaFn<infer S>
    ? useRegleSchemaFn<S, { dispose: () => void; register: () => void }, { namespace?: MaybeRefOrGetter<string> }>
    : useRegleSchemaFn,
>(options?: {
  customUseRegle?: TCustomRegle;
  customStore?: Ref<ScopedInstancesRecordLike>;
}): {
  useScopedRegle: TReturnedRegle;
  useCollectScope<TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(
    namespace?: MaybeRefOrGetter<string>
  ): {
    r$: MergedScopedRegles<TValue>;
  };
} => {
  const { customStore, customUseRegle = useRegleSchema } = options ?? {};
  return createScopedUseRegle({ customStore, customUseRegle } as any) as any;
};
