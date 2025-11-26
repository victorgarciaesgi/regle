import { computed, reactive, ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type { RegleRoot, ScopedInstancesRecord, SuperCompatibleRegleRoot } from '../../types';
import { mergeRegles, type MergedRegles, type MergedScopedRegles } from '../mergeRegles';

export type useCollectScopeFn<TNamedScoped extends boolean = false> = TNamedScoped extends true
  ? <const TValue extends Record<string, Record<string, any>>>(
      namespace?: MaybeRefOrGetter<string>
    ) => {
      r$: MergedRegles<{
        [K in keyof TValue]: RegleRoot<TValue[K]> & SuperCompatibleRegleRoot;
      }>;
    }
  : <TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(
      namespace?: MaybeRefOrGetter<string>
    ) => {
      r$: MergedScopedRegles<TValue>;
    };

export function createUseCollectScope<TNamedScoped extends boolean = false>(
  instances: Ref<ScopedInstancesRecord>,
  options: { asRecord?: TNamedScoped }
): { useCollectScope: useCollectScopeFn<TNamedScoped> } {
  function useCollectScope(namespace?: MaybeRefOrGetter<string>): {
    r$: MergedScopedRegles<Record<string, unknown>[]> | MergedRegles<Record<string, SuperCompatibleRegleRoot>>;
  } {
    const computedNamespace = computed(() => toValue(namespace));

    setEmptyNamespace();

    const r$ = ref<MergedScopedRegles | MergedRegles<any>>(collectRegles(instances.value));

    const regle = reactive({ r$ });

    function setEmptyNamespace() {
      if (computedNamespace.value && !instances.value[computedNamespace.value]) {
        instances.value[computedNamespace.value] = {};
      }
    }

    watch(computedNamespace, setEmptyNamespace);

    watch(
      instances,
      (newInstances) => {
        r$.value = collectRegles(newInstances);
      },
      { deep: true }
    );

    function collectRegles(r$Instances: ScopedInstancesRecord) {
      if (computedNamespace.value) {
        const namespaceInstances = r$Instances[computedNamespace.value] ?? {};
        return mergeRegles(namespaceInstances, !options.asRecord);
      } else {
        return mergeRegles(r$Instances['~~global'] ?? {}, !options.asRecord);
      }
    }

    return { r$: regle.r$ as any };
  }

  return { useCollectScope: useCollectScope as any };
}
