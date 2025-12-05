import { ref, type Ref } from 'vue';
import type { ExtendedRulesDeclarations, ScopedInstancesRecord, ScopedInstancesRecordLike } from '../../types';
import { createGlobalState } from '../../utils';
import { type useRegleFn } from '../useRegle';
import { createUseCollectScope, type useCollectScopeFn } from './useCollectScope';
import { createUseScopedRegleComposable, type UseScopedRegleOptions } from './useScopedRegle';

export type CreateScopedUseRegleOptions<TCustomRegle extends useRegleFn<any, any>, TAsRecord extends boolean> = {
  /**
   * Inject a global configuration to the exported composables to keep your translations and typings
   */
  customUseRegle?: TCustomRegle;
  /**
   * Store the collected instances externally
   */
  customStore?: Ref<ScopedInstancesRecordLike>;
  /**
   * Collect instances in a Record instead of an array
   *
   * ⚠️ Each nested `useScopedRegle` must provide a parameter `id` to be collected.
   */
  asRecord?: TAsRecord;
};

/**
 * Create a scoped validation system for collecting and validating multiple form instances.
 * Useful for dynamic forms, multi-step wizards, or component-based form architectures.
 *
 * @param options - Configuration options
 * @param options.customUseRegle - Custom useRegle instance with your global config
 * @param options.customStore - External ref to store collected instances
 * @param options.asRecord - If true, collect instances in a Record (requires `id` param in useScopedRegle)
 * @returns Object containing `useScopedRegle` and `useCollectScope` functions
 *
 * @example
 * ```ts
 * // scoped-config.ts
 * import { createScopedUseRegle } from '@regle/core';
 *
 * export const { useScopedRegle, useCollectScope } = createScopedUseRegle();
 *
 * // ChildComponent.vue
 * const { r$ } = useScopedRegle(state, rules, {
 *   namespace: 'myForm'
 * });
 *
 * // ParentComponent.vue
 * const { r$: collectedR$ } = useCollectScope('myForm');
 * await collectedR$.$validate(); // Validates all child forms
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/scoped-validation Documentation}
 */
export function createScopedUseRegle<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<ExtendedRulesDeclarations>>,
  TAsRecord extends boolean = false,
  TReturnedRegle extends useRegleFn<any, any, any, any> = TCustomRegle extends useRegleFn<infer A, infer B>
    ? useRegleFn<A, B, { dispose: () => void; register: () => void }, UseScopedRegleOptions<TAsRecord>>
    : useRegleFn<
        Partial<ExtendedRulesDeclarations>,
        any,
        { dispose: () => void; register: () => void },
        UseScopedRegleOptions<TAsRecord>
      >,
>(
  options?: CreateScopedUseRegleOptions<TCustomRegle, TAsRecord>
): {
  useScopedRegle: TReturnedRegle;
  useCollectScope: useCollectScopeFn<TAsRecord>;
} {
  const useInstances = options?.customStore
    ? () => {
        if (options.customStore) {
          if (!options.customStore?.value['~~global']) {
            options.customStore.value['~~global'] = {};
          } else if (options.customStore?.value) {
            options.customStore.value = { '~~global': {} };
          }
        }
        return options.customStore as Ref<ScopedInstancesRecord>;
      }
    : createGlobalState(() => {
        const $inst = ref<ScopedInstancesRecord>({ '~~global': {} });
        return $inst;
      });

  const instances = useInstances();

  const { useScopedRegle } = createUseScopedRegleComposable(instances, options?.customUseRegle);
  const { useCollectScope } = createUseCollectScope(instances, { asRecord: options?.asRecord });

  return {
    useScopedRegle: useScopedRegle as unknown as TReturnedRegle,
    useCollectScope: useCollectScope,
  };
}

const { useCollectScope, useScopedRegle } = createScopedUseRegle();

export { useCollectScope, useScopedRegle };
