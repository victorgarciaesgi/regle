import { ref, type Ref } from 'vue';
import type { AllRulesDeclarations, ScopedInstancesRecord, ScopedInstancesRecordLike } from '../../types';
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
   * ⚠️ Each nested `useScopedRegle` must provide a parameter `scopeKey` to be collected.
   */
  asRecord?: TAsRecord;
};

export function createScopedUseRegle<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<AllRulesDeclarations>>,
  TAsRecord extends boolean = false,
  TReturnedRegle extends useRegleFn<any, any, any, any> = TCustomRegle extends useRegleFn<infer A, infer B>
    ? useRegleFn<A, B, { dispose: () => void; register: () => void }, UseScopedRegleOptions<TAsRecord>>
    : useRegleFn<
        Partial<AllRulesDeclarations>,
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
