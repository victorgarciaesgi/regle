import type { useCollectScope, MergedScopedRegles, UseScopedRegleOptions, useCollectScopeFn } from '@regle/core';
import { createScopedUseRegle, type CreateScopedUseRegleOptions } from '@regle/core';
import { useRegleSchema, type useRegleSchemaFn } from './useRegleSchema';
import type { MaybeRefOrGetter, Ref } from 'vue';

type CreateScopedUseRegleSchemaOptions<
  TCustomRegle extends useRegleSchemaFn<any, any>,
  TAsRecord extends boolean,
> = Omit<CreateScopedUseRegleOptions<any, TAsRecord>, 'customUseRegle'> & {
  /**
   * Inject a global configuration to the exported composables to keep your translations and typings
   */
  customUseRegle?: TCustomRegle;
};

export const { useCollectScope: useCollectSchemaScope, useScopedRegle: useScopedRegleSchema } = createScopedUseRegle({
  customUseRegle: useRegleSchema as any,
}) as unknown as { useCollectScope: typeof useCollectScope; useScopedRegle: typeof useRegleSchema };

export const createScopedUseRegleSchema = <
  TCustomRegle extends useRegleSchemaFn = useRegleSchemaFn,
  TAsRecord extends boolean = false,
  TReturnedRegle extends useRegleSchemaFn<any, any, any> = TCustomRegle extends useRegleSchemaFn<infer S>
    ? useRegleSchemaFn<S, { dispose: () => void; register: () => void }, UseScopedRegleOptions<TAsRecord>>
    : useRegleSchemaFn<any, { dispose: () => void; register: () => void }, UseScopedRegleOptions<TAsRecord>>,
>(
  options?: CreateScopedUseRegleSchemaOptions<TCustomRegle, TAsRecord>
): {
  useScopedRegle: TReturnedRegle;
  useCollectScope: useCollectScopeFn<TAsRecord>;
} => {
  const { customStore, customUseRegle = useRegleSchema, asRecord = false } = options ?? {};
  return createScopedUseRegle({ customStore, customUseRegle, asRecord } as any) as any;
};
