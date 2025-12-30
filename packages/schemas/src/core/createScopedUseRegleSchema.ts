import type {
  MergedScopedRegles,
  RegleShortcutDefinition,
  UseScopedRegleOptions,
  useCollectScope,
  useCollectScopeFn,
} from '@regle/core';
import { createScopedUseRegle, type CreateScopedUseRegleOptions } from '@regle/core';
import { useRegleSchema, type useRegleSchemaFn } from './useRegleSchema';
import type { MaybeRefOrGetter } from 'vue';

type CreateScopedUseRegleSchemaOptions<
  TCustomRegle extends useRegleSchemaFn<any, any>,
  TAsRecord extends boolean,
> = Omit<CreateScopedUseRegleOptions<any, TAsRecord>, 'customUseRegle'> & {
  /**
   * Inject a global configuration to the exported composables to keep your translations and typings
   */
  customUseRegle?: TCustomRegle;
};

/**
 * Create a scoped validation system for schema-based validation.
 * Similar to `createScopedUseRegle` but for use with Standard Schema libraries.
 *
 * @param options - Configuration options
 * @param options.customUseRegle - Custom useRegleSchema instance with your global config
 * @param options.customStore - External ref to store collected instances
 * @param options.asRecord - If true, collect instances in a Record (requires `id` param)
 * @returns Object containing `useScopedRegle` and `useCollectScope` functions
 *
 * @example
 * ```ts
 * import { createScopedUseRegleSchema, defineRegleSchemaConfig } from '@regle/schemas';
 *
 * const { useRegleSchema } = defineRegleSchemaConfig({...});
 *
 * export const { useScopedRegle, useCollectScope } = createScopedUseRegleSchema({
 *   customUseRegle: useRegleSchema
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/scoped-validation Documentation}
 */
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

const { useCollectScope: _useCollectSchemaScope, useScopedRegle: _useScopedRegleSchema } = createScopedUseRegle({
  customUseRegle: useRegleSchema as any,
}) as unknown as { useCollectScope: typeof useCollectScope; useScopedRegle: typeof useRegleSchema };

const useCollectSchemaScope: <TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(
  namespace?: MaybeRefOrGetter<string | string[]>
) => {
  r$: MergedScopedRegles<TValue>;
} = _useCollectSchemaScope;

const useScopedRegleSchema: useRegleSchemaFn<RegleShortcutDefinition<any>, {}, {}> = _useScopedRegleSchema;

export { useCollectSchemaScope, useScopedRegleSchema };
