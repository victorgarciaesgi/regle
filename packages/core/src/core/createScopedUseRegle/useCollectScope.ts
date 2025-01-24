import { computed, reactive, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import type { ScopedInstancesRecord } from '../../types';
import { mergeRegles, type MergedScopedRegles } from '../mergeRegles';

export function createUseCollectScope(instances: Ref<ScopedInstancesRecord>): {
  useCollectScope<TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(): {
    r$: MergedScopedRegles<TValue>;
  };
} {
  function useCollectScope<TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(
    namespace?: MaybeRefOrGetter<string>
  ): {
    r$: MergedScopedRegles<TValue>;
  } {
    const computedNamespace = computed(() => toValue(namespace));

    setEmptyNamespace();

    const r$ = ref<MergedScopedRegles>(collectRegles(instances.value));

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
        return mergeRegles(namespaceInstances, true);
      } else {
        return mergeRegles(r$Instances['~~global'] ?? {}, true);
      }
    }

    return { r$: regle.r$ as any };
  }

  return { useCollectScope };
}
