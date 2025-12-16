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

const { useCollectScope: _useCollectScope, useScopedRegle: _useScopedRegle } = createScopedUseRegle();

/**
 * Composable to collect and merge all Regle instances created with the default `useScopedRegle` within the same scope.
 * Returns a merged `r$` object allowing validation across multiple components simultaneously.
 *
 * Children properties like `$value` and `$errors` are converted to arrays instead of objects.
 * You have access to all validation properties like `$error`, `$invalid`, `$validate()`, etc.
 *
 * @param namespace - Optional namespace or array of namespaces to filter which scoped instances to collect
 * @returns Object containing `r$` - the merged Regle instance with array-based properties
 *
 * @example
 * ```ts
 * // ParentComponent.vue
 * import { useCollectScope } from '@regle/core';
 *
 * const { r$ } = useCollectScope();
 * // Or with namespace filtering
 * const { r$ } = useCollectScope('contacts');
 *
 * // Validate all collected forms
 * const { result, data } = await r$.$validate();
 * // Access collected errors
 * console.log(r$.$errors);
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/scoped-validation Documentation}
 */
const useCollectScope = _useCollectScope;

/**
 * Clone of `useRegle` that automatically registers its instance for collection by `useCollectScope`.
 * Every time it's called, a new instance is added for the parent scope to collect.
 *
 * Can be called multiple times anywhere in your app - not restricted to components or DOM.
 * When the component is unmounted or scope is disposed, the instance is automatically unregistered.
 *
 * @param state - Reactive state object to validate
 * @param rules - Validation rules to apply
 * @param options - Configuration options including optional `namespace` for scoping
 * @returns Object containing `r$` (Regle instance), `dispose()` and `register()` methods
 *
 * @example
 * ```ts
 * // ChildComponent.vue
 * import { useScopedRegle } from '@regle/core';
 *
 * const { r$ } = useScopedRegle(
 *   { email: '' },
 *   { email: { required, email } },
 *   { namespace: 'contacts' }
 * );
 * ```
 *
 * @see {@link https://reglejs.dev/advanced-usage/scoped-validation Documentation}
 */
const useScopedRegle = _useScopedRegle;

export { useCollectScope, useScopedRegle };
